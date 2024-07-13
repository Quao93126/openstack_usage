from collections import defaultdict
import cv2
import numpy as np
from cellpose import core, utils, io, models, metrics, plot
import skimage.io
import matplotlib.pyplot as plt
import matplotlib as mpl
from pathlib import Path
from natsort import natsorted
import time, os, sys, random
from tqdm import tqdm
from glob import glob


def preview_imgs(target_images):
    fig, axes = plt.subplots(1, 3, figure=(10, 6), dpi=200)
    for i in range(3):
        target_img = random.choice(target_images)
        title = Path(target_img).stem
        target_img = cv2.imread(target_img)
        axes[i].imshow(target_img[..., ::-1]), axes[i].set_title(f'{title}'), axes[i].axis('off')
        


def detect_circle(src):

    # get the original centroid of the image
    h, w, _ = src.shape

    gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
    #gray = cv2.medianBlur(gray, 5)
    rows = gray.shape[0]

    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1, rows / 16,
                               param1=175, param2=110,
                               minRadius=100, maxRadius=0)

    info = defaultdict(list)

    if circles is not None:
        circles = np.uint16(np.around(circles))
        for i in circles[0, :]:
            center = (i[0], i[1])
            # circle center
            cv2.circle(src, center, 1, (0, 100, 100), 3)
            # circle outline
            radius = i[2]
            cv2.circle(src, center, radius, (255, 0, 255), 3)
            info['radius'].append(radius)
            info['center'].append(center)

    return src, info


def test_images(target_images):
    fig, axes = plt.subplots(6, 3, figsize=(12, 12),  dpi=200)
    axes = axes.flatten()

    final_info = []
    
    for fn_img, ax in zip(target_images, axes):
        img = cv2.imread(fn_img)
        fn = Path(fn_img).stem
        # resize img, since the image is so large
        h, w, _ = img.shape
        print(h,w)
        new_h, new_w = int(h/10), int(w/10)
        img = cv2.resize(img, (new_w, new_h))

        # detect circles
        img, info = detect_circle(img)
        cv2.imwrite("output1.jpg", img)
        final_info.append(info)

    print(final_info)
    return final_info
    

def checkIsInCircle(info,x,y):
    
    rad = info[0]['radius'][0] * 10
    center = info[0]['center'][0]
    circle_x = center[0] * 10
    circle_y = center[1] * 10

    # Compare radius of circle
    # with distance of its center
    # from given point
    if ((x - circle_x) * (x - circle_x) +
        (y - circle_y) * (y - circle_y) <= rad * rad):
        return True
    else:
        return False


def cropImageFromDetectedCircle(image, info):

    radius = info[0]['radius'][0] * 10
    center = info[0]['center'][0]
    center_x = center[0] * 10
    center_y = center[1] * 10

    h, w , _ = image.shape

    for i in range(h):
        for j in range(w):
            if checkIsInCircle(info, j, i) == False:
                image[i][j] = 255

    return image


# target_images = natsorted(glob('./celigo_test.tiff', recursive=True))
# org_image = cv2.imread("./celigo_test.tiff")

# final_info = test_images(target_images)
# cropped_image = cropImageFromDetectedCircle(org_image, final_info)

# cv2.imwrite("circled.jpg", cropped_image)

org_dir = "E:\\4-24-LabelFree\\Nikon\\Original"
result_dir = "E:\\4-24-LabelFree\\Nikon\\circled"

import os
files = [f for f in os.listdir(org_dir) if os.path.isfile(os.path.join(org_dir, f))]

for file in files:
    target_images = [os.path.join(org_dir, file)]
    org_image = cv2.imread(os.path.join(org_dir, file))
    final_info = test_images(target_images)
    cropped_image = cropImageFromDetectedCircle(org_image, final_info)

    resPath = os.path.join(result_dir, file)
    cv2.imwrite(resPath, cropped_image)

    



