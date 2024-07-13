import cv2
import numpy as np
import sys
import random
import os

sys.setrecursionlimit(10000000)

flag = []
height = 0
width = 0
tot_res = []

direction = [[1,0],[0,1],[-1,0],[0,-1]]


def random_color():
    levels = range(32,256,32)
    return tuple(random.choice(levels) for _ in range(3))

def dfs(src,i,j,ret):
    global width, height, flag

    for di in direction:
        x = i + di[0]
        y = j + di[1]
        if  x < 0 or x >= width or y < 0 or y >= height:
            continue
        if flag[y][x] == 1:
            continue
        if src[y][x] != 255:
            continue
        flag[y][x] = 1
        ret.append([x,y])
        dfs(src,x,y,ret)


def getExtractAllClasses(src):
    global width, height
    height = src.shape[0]
    width = src.shape[1]
    res = []
    global flag
    flag = np.zeros((height, width))

    for i in range(width):
        for j in range(height):
            if(src[j][i] == 255) and flag[j][i] == 0:
                ret = [[i,j]]
                flag[j][i] = 1
                dfs(src,i,j, ret)
                if(len(ret) < 25):
                    continue
                res.append(ret)

    return res


def cropSegmentsFromOriginalImage(orgImage, dir_path):
    if os.path.exists(dir_path) == False:
        os.mkdir(dir_path)
    

    global tot_res

    i = 1
    for res in tot_res:
        xList = [x for [x,y] in res]
        yList = [y for [x,y] in res]
        minX = np.min(xList)
        maxX = np.max(xList)
        minY = np.min(yList)
        maxY = np.max(yList)

        temp_width = maxX - minX + 1
        temp_height = maxY - minY + 1

        tempImage = np.zeros((temp_height, temp_width,3))

        for [x,y] in res:
            real_x = x - minX
            real_y = y - minY
            tempImage[real_y][real_x] = orgImage[y][x]
        
        file_name = str(i)+".jpg"
        file_path = os.path.join(dir_path, file_name)
        cv2.imwrite( file_path, tempImage)

        i = i + 1
        



def cellpose_segment(image_path, origin_image_path, result_directory):

    #preprocess
    image = cv2.imread(image_path)
    binImg = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    binImg[binImg > 128] = 255

    tot_res = getExtractAllClasses(binImg)


    resImg = np.zeros((height,width,3))

    for res in tot_res:
        color = random_color()
        for [x,y] in res:
            resImg[y][x] = color

    cv2.imwrite("colored.jpg", resImg)

    orgImage = cv2.imread(origin_image_path)
    cropSegmentsFromOriginalImage(orgImage, result_directory)
