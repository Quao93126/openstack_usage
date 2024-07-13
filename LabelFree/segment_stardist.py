from stardist.models import StarDist2D

# prints a list of available models
StarDist2D.from_pretrained()

# creates a pretrained model
model = StarDist2D.from_pretrained('2D_versatile_fluo')


from stardist.data import test_image_nuclei_2d
from stardist.plot import render_label
from csbdeep.utils import normalize
import matplotlib.pyplot as plt
import cv2

img = cv2.imread("./out1.png",  cv2.IMREAD_GRAYSCALE)
# img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

cv2.imwrite('result.png', img)

print(img)

labels, _ = model.predict_instances(normalize(img))
cv2.imwrite("gray.jpg", normalize(img) )

plt.subplot(1,2,1)
plt.imshow(img, cmap="gray")
plt.axis("off")
plt.title("input image")

plt.subplot(1,2,2)
plt.imshow(render_label(labels, img=img))
plt.axis("off")
plt.title("prediction + input overlay")

cv2.imwrite("result_segment.jpg",render_label(labels, img=img) )

plt.show()