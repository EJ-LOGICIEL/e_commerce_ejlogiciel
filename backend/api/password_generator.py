import random
import string


def generate_password(
    length: int, has_special: bool = False, has_number: bool = False
) -> str:
    """Generate a random password with the given length and options"""
    password: str = ""
    all_chars: str = string.ascii_lowercase + string.ascii_uppercase
    digits: str = string.digits
    punctuation: str = string.punctuation

    contain_special_chars: bool = True
    contain_numbers: bool = True

    if has_special:
        contain_special_chars = False  # if  has_special is True, then the password must contain special characters
        all_chars += punctuation
    if has_number:
        contain_numbers = (
            False  # if  has_number is True, then the password must contain numbers
        )
        all_chars += digits
    i: int = 0

    while i < length or not contain_special_chars or not contain_numbers:
        char: str = random.choice(all_chars)
        password += char
        if char in digits:
            contain_numbers = True
        elif char in punctuation:
            contain_special_chars = True
        i += 1

    return password
