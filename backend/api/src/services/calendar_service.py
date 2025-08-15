import os
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import requests
from src.database import db
from src.models.calendar import CalendarIntegration

class CalendarService:
    
    # Google Calendar configuration
    GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar']
    GOOGLE_CLIENT_CONFIG = {
        'web': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token',
            'redirect_uris': [os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/api/calendar/google/callback')]
        }
    }
    
    # Microsoft Graph configuration
    MICROSOFT_CLIENT_ID = os.getenv('MICROSOFT_CLIENT_ID')
    MICROSOFT_CLIENT_SECRET = os.getenv('MICROSOFT_CLIENT_SECRET')
    MICROSOFT_REDIRECT_URI = os.getenv('MICROSOFT_REDIRECT_URI', 'http://localhost:5000/api/calendar/microsoft/callback')
    MICROSOFT_SCOPES = ['https://graph.microsoft.com/calendars.readwrite']
    
    @staticmethod
    def get_google_auth_url(user_id):
        """Get Google OAuth authorization URL"""
        try:
            flow = Flow.from_client_config(
                CalendarService.GOOGLE_CLIENT_CONFIG,
                scopes=CalendarService.GOOGLE_SCOPES
            )
            flow.redirect_uri = CalendarService.GOOGLE_CLIENT_CONFIG['web']['redirect_uris'][0]
            
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=str(user_id)  # Pass user_id in state
            )
            
            return authorization_url
            
        except Exception as e:
            raise Exception(f"Failed to get Google auth URL: {str(e)}")
    
    @staticmethod
    def handle_google_callback(code, state):
        """Handle Google OAuth callback"""
        try:
            user_id = int(state)
            
            flow = Flow.from_client_config(
                CalendarService.GOOGLE_CLIENT_CONFIG,
                scopes=CalendarService.GOOGLE_SCOPES
            )
            flow.redirect_uri = CalendarService.GOOGLE_CLIENT_CONFIG['web']['redirect_uris'][0]
            
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Store credentials in database
            integration = CalendarIntegration.query.filter_by(
                user_id=user_id,
                provider='google'
            ).first()
            
            if integration:
                integration.access_token = credentials.token
                integration.refresh_token = credentials.refresh_token
                integration.token_expiry = credentials.expiry
                integration.is_active = True
                integration.updated_at = datetime.utcnow()
            else:
                integration = CalendarIntegration(
                    user_id=user_id,
                    provider='google',
                    access_token=credentials.token,
                    refresh_token=credentials.refresh_token,
                    token_expiry=credentials.expiry,
                    is_active=True
                )
                db.session.add(integration)
            
            db.session.commit()
            return integration
            
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to handle Google callback: {str(e)}")
    
    @staticmethod
    def get_microsoft_auth_url(user_id):
        """Get Microsoft OAuth authorization URL"""
        try:
            auth_url = (
                f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"
                f"client_id={CalendarService.MICROSOFT_CLIENT_ID}&"
                f"response_type=code&"
                f"redirect_uri={CalendarService.MICROSOFT_REDIRECT_URI}&"
                f"scope={' '.join(CalendarService.MICROSOFT_SCOPES)}&"
                f"state={user_id}&"
                f"response_mode=query"
            )
            
            return auth_url
            
        except Exception as e:
            raise Exception(f"Failed to get Microsoft auth URL: {str(e)}")
    
    @staticmethod
    def handle_microsoft_callback(code, state):
        """Handle Microsoft OAuth callback"""
        try:
            user_id = int(state)
            
            # Exchange code for token
            token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
            token_data = {
                'client_id': CalendarService.MICROSOFT_CLIENT_ID,
                'client_secret': CalendarService.MICROSOFT_CLIENT_SECRET,
                'code': code,
                'redirect_uri': CalendarService.MICROSOFT_REDIRECT_URI,
                'grant_type': 'authorization_code'
            }
            
            response = requests.post(token_url, data=token_data)
            response.raise_for_status()
            token_info = response.json()
            
            # Calculate expiry time
            expires_in = token_info.get('expires_in', 3600)
            expiry = datetime.utcnow() + timedelta(seconds=expires_in)
            
            # Store credentials in database
            integration = CalendarIntegration.query.filter_by(
                user_id=user_id,
                provider='microsoft'
            ).first()
            
            if integration:
                integration.access_token = token_info['access_token']
                integration.refresh_token = token_info.get('refresh_token')
                integration.token_expiry = expiry
                integration.is_active = True
                integration.updated_at = datetime.utcnow()
            else:
                integration = CalendarIntegration(
                    user_id=user_id,
                    provider='microsoft',
                    access_token=token_info['access_token'],
                    refresh_token=token_info.get('refresh_token'),
                    token_expiry=expiry,
                    is_active=True
                )
                db.session.add(integration)
            
            db.session.commit()
            return integration
            
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to handle Microsoft callback: {str(e)}")
    
    @staticmethod
    def refresh_google_token(integration):
        """Refresh Google access token"""
        try:
            credentials = Credentials(
                token=integration.access_token,
                refresh_token=integration.refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=CalendarService.GOOGLE_CLIENT_CONFIG['web']['client_id'],
                client_secret=CalendarService.GOOGLE_CLIENT_CONFIG['web']['client_secret']
            )
            
            credentials.refresh(Request())
            
            # Update stored credentials
            integration.access_token = credentials.token
            integration.token_expiry = credentials.expiry
            integration.updated_at = datetime.utcnow()
            db.session.commit()
            
            return credentials
            
        except Exception as e:
            raise Exception(f"Failed to refresh Google token: {str(e)}")
    
    @staticmethod
    def refresh_microsoft_token(integration):
        """Refresh Microsoft access token"""
        try:
            token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
            token_data = {
                'client_id': CalendarService.MICROSOFT_CLIENT_ID,
                'client_secret': CalendarService.MICROSOFT_CLIENT_SECRET,
                'refresh_token': integration.refresh_token,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post(token_url, data=token_data)
            response.raise_for_status()
            token_info = response.json()
            
            # Calculate expiry time
            expires_in = token_info.get('expires_in', 3600)
            expiry = datetime.utcnow() + timedelta(seconds=expires_in)
            
            # Update stored credentials
            integration.access_token = token_info['access_token']
            if 'refresh_token' in token_info:
                integration.refresh_token = token_info['refresh_token']
            integration.token_expiry = expiry
            integration.updated_at = datetime.utcnow()
            db.session.commit()
            
            return integration.access_token
            
        except Exception as e:
            raise Exception(f"Failed to refresh Microsoft token: {str(e)}")
    
    @staticmethod
    def get_valid_credentials(user_id, provider):
        """Get valid credentials for user and provider"""
        integration = CalendarIntegration.query.filter_by(
            user_id=user_id,
            provider=provider,
            is_active=True
        ).first()
        
        if not integration:
            return None
        
        # Check if token needs refresh
        if integration.token_expiry and datetime.utcnow() >= integration.token_expiry:
            if provider == 'google':
                return CalendarService.refresh_google_token(integration)
            elif provider == 'microsoft':
                CalendarService.refresh_microsoft_token(integration)
                return integration.access_token
        
        if provider == 'google':
            return Credentials(
                token=integration.access_token,
                refresh_token=integration.refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=CalendarService.GOOGLE_CLIENT_CONFIG['web']['client_id'],
                client_secret=CalendarService.GOOGLE_CLIENT_CONFIG['web']['client_secret']
            )
        else:
            return integration.access_token
    
    @staticmethod
    def create_workout_event(user_id, workout_data, start_time, duration_minutes=60):
        """Create workout event in user's calendars"""
        results = {}
        
        # Try Google Calendar
        try:
            google_creds = CalendarService.get_valid_credentials(user_id, 'google')
            if google_creds:
                event = CalendarService._create_google_event(
                    google_creds, workout_data, start_time, duration_minutes
                )
                results['google'] = {'success': True, 'event_id': event['id']}
        except Exception as e:
            results['google'] = {'success': False, 'error': str(e)}
        
        # Try Microsoft Calendar
        try:
            microsoft_token = CalendarService.get_valid_credentials(user_id, 'microsoft')
            if microsoft_token:
                event = CalendarService._create_microsoft_event(
                    microsoft_token, workout_data, start_time, duration_minutes
                )
                results['microsoft'] = {'success': True, 'event_id': event['id']}
        except Exception as e:
            results['microsoft'] = {'success': False, 'error': str(e)}
        
        return results
    
    @staticmethod
    def _create_google_event(credentials, workout_data, start_time, duration_minutes):
        """Create event in Google Calendar"""
        service = build('calendar', 'v3', credentials=credentials)
        
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        event = {
            'summary': f"Workout: {workout_data['name']}",
            'description': f"{workout_data.get('description', '')}\n\nGenerated by FitForge",
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 15},
                    {'method': 'popup', 'minutes': 5},
                ],
            },
        }
        
        event = service.events().insert(calendarId='primary', body=event).execute()
        return event
    
    @staticmethod
    def _create_microsoft_event(access_token, workout_data, start_time, duration_minutes):
        """Create event in Microsoft Calendar"""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        event_data = {
            'subject': f"Workout: {workout_data['name']}",
            'body': {
                'contentType': 'text',
                'content': f"{workout_data.get('description', '')}\n\nGenerated by FitForge"
            },
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC'
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC'
            },
            'reminderMinutesBeforeStart': 15
        }
        
        response = requests.post(
            'https://graph.microsoft.com/v1.0/me/events',
            headers=headers,
            json=event_data
        )
        response.raise_for_status()
        
        return response.json()
    
    @staticmethod
    def get_user_integrations(user_id):
        """Get all calendar integrations for user"""
        integrations = CalendarIntegration.query.filter_by(
            user_id=user_id,
            is_active=True
        ).all()
        
        return [integration.to_dict() for integration in integrations]
    
    @staticmethod
    def disconnect_calendar(user_id, provider):
        """Disconnect calendar integration"""
        integration = CalendarIntegration.query.filter_by(
            user_id=user_id,
            provider=provider
        ).first()
        
        if integration:
            integration.is_active = False
            integration.updated_at = datetime.utcnow()
            db.session.commit()
            
        return True

