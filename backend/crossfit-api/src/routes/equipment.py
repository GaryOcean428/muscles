from flask import Blueprint, request, jsonify
from src.models.user import User, db
from src.models.equipment import Equipment, EquipmentTemplate
from datetime import datetime

equipment_bp = Blueprint('equipment', __name__)

def get_current_user():
    """Helper function to get current user from token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return User.verify_token(token)

@equipment_bp.route('/equipment', methods=['GET'])
def get_equipment():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        category = request.args.get('category')
        status = request.args.get('status')
        
        query = Equipment.query.filter_by(user_id=user.id)
        
        if category:
            query = query.filter_by(category=category)
        
        if status:
            query = query.filter_by(availability_status=status)
        
        equipment = query.order_by(Equipment.name).all()
        
        return jsonify({
            'equipment': [item.to_dict() for item in equipment]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get equipment', 'details': str(e)}), 500

@equipment_bp.route('/equipment/<int:equipment_id>', methods=['GET'])
def get_equipment_item(equipment_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        equipment = Equipment.query.filter_by(id=equipment_id, user_id=user.id).first()
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        return jsonify({'equipment': equipment.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get equipment', 'details': str(e)}), 500

@equipment_bp.route('/equipment', methods=['POST'])
def add_equipment():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate category
        valid_categories = ['weights', 'cardio', 'bodyweight', 'accessories', 'machines', 'other']
        if data['category'] not in valid_categories:
            return jsonify({'error': f'category must be one of: {valid_categories}'}), 400
        
        # Validate availability status
        if 'availability_status' in data:
            valid_statuses = ['available', 'unavailable', 'maintenance']
            if data['availability_status'] not in valid_statuses:
                return jsonify({'error': f'availability_status must be one of: {valid_statuses}'}), 400
        
        # Create equipment
        equipment = Equipment(
            user_id=user.id,
            name=data['name'],
            category=data['category'],
            availability_status=data.get('availability_status', 'available'),
            weight_range_min=data.get('weight_range_min'),
            weight_range_max=data.get('weight_range_max'),
            quantity=data.get('quantity', 1),
            notes=data.get('notes', '')
        )
        
        db.session.add(equipment)
        db.session.commit()
        
        return jsonify({
            'message': 'Equipment added successfully',
            'equipment': equipment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add equipment', 'details': str(e)}), 500

@equipment_bp.route('/equipment/<int:equipment_id>', methods=['PUT'])
def update_equipment(equipment_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        equipment = Equipment.query.filter_by(id=equipment_id, user_id=user.id).first()
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            equipment.name = data['name']
        
        if 'category' in data:
            valid_categories = ['weights', 'cardio', 'bodyweight', 'accessories', 'machines', 'other']
            if data['category'] not in valid_categories:
                return jsonify({'error': f'category must be one of: {valid_categories}'}), 400
            equipment.category = data['category']
        
        if 'availability_status' in data:
            valid_statuses = ['available', 'unavailable', 'maintenance']
            if data['availability_status'] not in valid_statuses:
                return jsonify({'error': f'availability_status must be one of: {valid_statuses}'}), 400
            equipment.availability_status = data['availability_status']
        
        if 'weight_range_min' in data:
            equipment.weight_range_min = data['weight_range_min']
        
        if 'weight_range_max' in data:
            equipment.weight_range_max = data['weight_range_max']
        
        if 'quantity' in data:
            equipment.quantity = data['quantity']
        
        if 'notes' in data:
            equipment.notes = data['notes']
        
        equipment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Equipment updated successfully',
            'equipment': equipment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update equipment', 'details': str(e)}), 500

@equipment_bp.route('/equipment/<int:equipment_id>', methods=['DELETE'])
def delete_equipment(equipment_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        equipment = Equipment.query.filter_by(id=equipment_id, user_id=user.id).first()
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        db.session.delete(equipment)
        db.session.commit()
        
        return jsonify({'message': 'Equipment deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete equipment', 'details': str(e)}), 500

@equipment_bp.route('/equipment-templates', methods=['GET'])
def get_equipment_templates():
    try:
        category = request.args.get('category')
        
        query = EquipmentTemplate.query
        
        if category:
            query = query.filter_by(category=category)
        
        templates = query.order_by(EquipmentTemplate.name).all()
        
        return jsonify({
            'templates': [template.to_dict() for template in templates]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get equipment templates', 'details': str(e)}), 500

@equipment_bp.route('/equipment/categories', methods=['GET'])
def get_equipment_categories():
    try:
        categories = [
            {'value': 'weights', 'label': 'Weights', 'description': 'Barbells, dumbbells, kettlebells, weight plates'},
            {'value': 'cardio', 'label': 'Cardio Equipment', 'description': 'Treadmills, bikes, rowing machines, ellipticals'},
            {'value': 'bodyweight', 'label': 'Bodyweight Equipment', 'description': 'Pull-up bars, dip stations, suspension trainers'},
            {'value': 'accessories', 'label': 'Accessories', 'description': 'Resistance bands, jump ropes, medicine balls'},
            {'value': 'machines', 'label': 'Machines', 'description': 'Cable machines, smith machines, leg press'},
            {'value': 'other', 'label': 'Other', 'description': 'Miscellaneous equipment'}
        ]
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get categories', 'details': str(e)}), 500

@equipment_bp.route('/equipment/bulk-add', methods=['POST'])
def bulk_add_equipment():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        equipment_list = data.get('equipment', [])
        
        if not equipment_list:
            return jsonify({'error': 'equipment list is required'}), 400
        
        added_equipment = []
        
        for item_data in equipment_list:
            # Validate required fields
            if not item_data.get('name') or not item_data.get('category'):
                continue  # Skip invalid items
            
            # Validate category
            valid_categories = ['weights', 'cardio', 'bodyweight', 'accessories', 'machines', 'other']
            if item_data['category'] not in valid_categories:
                continue  # Skip invalid items
            
            equipment = Equipment(
                user_id=user.id,
                name=item_data['name'],
                category=item_data['category'],
                availability_status=item_data.get('availability_status', 'available'),
                weight_range_min=item_data.get('weight_range_min'),
                weight_range_max=item_data.get('weight_range_max'),
                quantity=item_data.get('quantity', 1),
                notes=item_data.get('notes', '')
            )
            
            db.session.add(equipment)
            added_equipment.append(equipment)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully added {len(added_equipment)} equipment items',
            'equipment': [item.to_dict() for item in added_equipment]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to bulk add equipment', 'details': str(e)}), 500

