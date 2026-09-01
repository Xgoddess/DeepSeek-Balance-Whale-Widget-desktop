from PIL import Image
src = r'D:\Wideget\src-tauri\icons\icon.png'
dst = r'D:\Wideget\src-tauri\icons\icon.ico'
img = Image.open(src).convert('RGBA')
img.save(dst, sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
print('done', img.size)
