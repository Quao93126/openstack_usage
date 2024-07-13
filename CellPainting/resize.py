import cv2


image = cv2.imread("./LB35x20_64.tiff")


height, width, _ = image.shape

print(height)
print(width)

image = cv2.resize(image, (int(width/1), int(height/1)))

cv2.imwrite("out.jpg", image)

