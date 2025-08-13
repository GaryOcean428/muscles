import pytest
import os
from unittest.mock import Mock, patch, MagicMock

# Import the AIWorkoutGenerator
from src.ai_engine import AIWorkoutGenerator


class TestAIWorkoutGenerator:
    """Test the AIWorkoutGenerator class."""
    
    def test_groq_import_successful(self):
        """Test that Groq can be imported without ModuleNotFoundError."""
        # This test will fail if groq package is not installed
        try:
            from groq import Groq
            assert True
        except ModuleNotFoundError:
            pytest.fail("groq module not found - package not installed")
    
    @patch.dict(os.environ, {'GROQ_API_KEY': 'test-key-123'})
    def test_ai_generator_initialization_with_api_key(self):
        """Test that AIWorkoutGenerator initializes correctly with API key."""
        with patch('src.ai_engine.Groq') as mock_groq:
            generator = AIWorkoutGenerator()
            
            # Verify Groq was called with the API key
            mock_groq.assert_called_once_with(api_key='test-key-123')
            assert generator.groq_api_key == 'test-key-123'
    
    def test_ai_generator_initialization_without_api_key(self):
        """Test that AIWorkoutGenerator raises error without API key."""
        # Ensure GROQ_API_KEY is not set
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="GROQ_API_KEY environment variable is required"):
                AIWorkoutGenerator()
    
    @patch.dict(os.environ, {'GROQ_API_KEY': 'test-key-123'})
    @patch('src.ai_engine.Groq')
    def test_call_openai_api_parameters(self, mock_groq):
        """Test that _call_openai_api uses correct parameters for Groq."""
        # Setup mocks
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '{"workout_name": "Test Workout"}'
        mock_client.chat.completions.create.return_value = mock_completion
        
        generator = AIWorkoutGenerator()
        result = generator._call_openai_api("test prompt")
        
        # Verify the API call was made with correct parameters
        mock_client.chat.completions.create.assert_called_once_with(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": "You are an expert fitness trainer who creates personalized workout plans. Always respond with valid JSON."},
                {"role": "user", "content": "test prompt"}
            ],
            max_tokens=2048,
            temperature=0.7,
            top_p=1,
            stream=False
        )
        
        # Verify the result
        assert result == '{"workout_name": "Test Workout"}'
    
    @patch.dict(os.environ, {'GROQ_API_KEY': 'test-key-123'})
    @patch('src.ai_engine.Groq')
    def test_call_openai_api_error_handling(self, mock_groq):
        """Test that API errors are handled gracefully with fallback."""
        # Setup mocks to simulate an API error
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        
        generator = AIWorkoutGenerator()
        result = generator._call_openai_api("test prompt")
        
        # Should return fallback workout JSON
        assert "Basic HIIT Workout" in result
        assert "workout_name" in result
    
    @patch.dict(os.environ, {'GROQ_API_KEY': 'test-key-123'})
    @patch('src.ai_engine.Groq')
    def test_generate_fallback_workout(self, mock_groq):
        """Test fallback workout generation."""
        mock_groq.return_value = MagicMock()
        generator = AIWorkoutGenerator()
        
        fallback_result = generator._generate_fallback_workout()
        
        # Verify fallback workout structure
        import json
        fallback_data = json.loads(fallback_result)
        
        assert "workout_name" in fallback_data
        assert "description" in fallback_data
        assert "main_exercises" in fallback_data
        assert "warm_up" in fallback_data
        assert "cool_down" in fallback_data
        assert fallback_data["workout_name"] == "Basic HIIT Workout"
        assert len(fallback_data["main_exercises"]) > 0