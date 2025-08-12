import pytest

def test_simple_addition():
    """Simple test to verify pytest is working."""
    assert 1 + 1 == 2

def test_simple_string():
    """Simple string test."""
    assert "hello" + " world" == "hello world"

class TestBasic:
    """Basic test class."""
    
    def test_basic_assertion(self):
        """Basic assertion test."""
        assert True is True
        assert False is False
    
    def test_list_operations(self):
        """Test list operations."""
        test_list = [1, 2, 3]
        test_list.append(4)
        assert len(test_list) == 4
        assert 4 in test_list

