import glob
import re

files = glob.glob('*.html')
files.remove('index.html')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract nav menu to find "Trash the Dress" and insert Video
    content = re.sub(
        r'(<a href=\"trash-the-dress\.html\"[^>]*>Trash the Dress<\/a>\s*)<a href=\"contact\.html\"',
        r'\1<a href=\"video.html\" class=\"nav__link\">Video</a>\n            <a href=\"contact.html\"',
        content
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Nav links updated.')
