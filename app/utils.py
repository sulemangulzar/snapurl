import random
import string


def short_code_generation(length=6):
    characters = string.ascii_letters + string.digits
    return "".join(random.choices(characters, k=length))
