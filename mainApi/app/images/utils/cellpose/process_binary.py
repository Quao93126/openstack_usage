import cv2
import numpy as np



def convertBinary2SelectedColorImage(orgImg, color):

    width = orgImg.shape[1]
    height = orgImg.shape[0]
    dim = orgImg.shape[2]
    res = orgImg.copy()
    
    for i in range(width):
        for j in range(height):
            if orgImg[j][i][0] == 255 and orgImg[j][i][1] == 255 and orgImg[j][i][2] == 255:
                for k in range(dim):
                    res[j][i][k] = color[k]
            else:
                res[j][i] = [0,0,0]

    return res


def convert2Binary(image):
    src_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    ret, thresh = cv2.threshold(src_gray,0,255,cv2.THRESH_BINARY_INV)

    thresh = ~thresh

    # noise removal
    kernel = np.ones((3,3),np.uint8)
    opening = cv2.morphologyEx(thresh,cv2.MORPH_OPEN,kernel, iterations = 2)

    return opening