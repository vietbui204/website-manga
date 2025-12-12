import sys
import os

def process_file(filepath):
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        in_code_block = False
        
        for line in lines:
            stripped = line.strip()
            # Detect code block toggle
            if stripped.startswith('```'):
                in_code_block = not in_code_block
                new_lines.append(line)
                continue
            
            if in_code_block:
                new_lines.append(line)
            else:
                # Remove all asterisks in non-code lines
                new_line = line.replace('*', '')
                new_lines.append(new_line)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Done: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == '__main__':
    files = [
        r'c:\Users\admin1\Desktop\website_manga\docs\CHUONG_1_TONG_QUAN.md',
        r'c:\Users\admin1\Desktop\website_manga\docs\CHUONG_2_PHAN_TICH_YEU_CAU.md',
        r'c:\Users\admin1\Desktop\website_manga\docs\CHUONG_3_THIET_KE_HE_THONG.md'
    ]
    for f in files:
        if os.path.exists(f):
            process_file(f)
        else:
            print(f"File not found: {f}")
