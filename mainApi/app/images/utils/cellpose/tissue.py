import os
from cellpose import models
import numpy as np
import time, os, sys
from urllib.parse import urlparse
import skimage.io
import matplotlib.pyplot as plt
import matplotlib as mpl
from urllib.parse import urlparse
from cellpose import models, core
import cv2
import math
import random
import pandas as pd

# DISPLAY RESULTS
from cellpose import plot
from mainApi.app.images.utils.cellpose.process_binary import convert2Binary
from mainApi.app.images.utils.cellpose.cellpose_segment import cellpose_segment


MIN_THRESH = 10
BLACK_VALUE = 0
WHITE_VALUE = 255


TISSUE_COLORS = {
    "S" : [128,128,128],
    "R" : [0,0,255],
    "G": [0,255,0],
    "B" : [255,0,0],
    "B+G" : [255,255,0],
    "B+R" : [255,0,255],
    "S+B" : [255,128,128],
    "S+G" : [128,255,128],
    "G+R" : [0,255,255],
    "B+G+R" : [255,255,255],
    "S+G+R" : [128,255,255],
    "S+B+R" : [255,128,255],
    "S+B+G" : [255,255,128],
    "S+B+G+R" : [178,178,178]
}

def getBinaryImage(image):
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    ret, binary  = cv2.threshold(gray,MIN_THRESH,WHITE_VALUE,BLACK_VALUE)
    return binary


def process_TissueNT_Segmentation(input_path, output_directory, channel):

    print("This is process_TissueNT_Segmentation function in tissue.py file...")

    img = skimage.io.imread(input_path)
    
    use_GPU = core.use_gpu()
    print('>>> GPU activated? %d'%use_GPU)

    # DEFINE CELLPOSE MODEL
    # model_type='cyto' or model_type='nuclei'
    model = models.Cellpose(gpu=use_GPU, model_type='cyto')

    channels = []
    if channel == "R":
        channels = [[1,1]]
    if channel == "S":
        channels = [[0,0]]
    if channel == "B":
        channels = [[3,3]]
    if channel == "G":
        channels = [[2,2]]
    masks, flows, styles, diams = model.eval([img], diameter=None, flow_threshold=None, channels=channels)
    
    idx = 0
    maski = masks[idx]
    flowi = flows[idx][0]


    mask_output_filename = "mask_output.jpg"
    flow_output_filename = "flow_output.jpg"


    mask_output_path = os.path.join(output_directory, mask_output_filename)
    flow_output_path = os.path.join(output_directory, flow_output_filename)


    print(mask_output_path)
    print(flow_output_path)

    
    cv2.imwrite(mask_output_path, maski)
    cv2.imwrite(flow_output_path,  flowi)



def process_TissueNT_Test_Segmentation(input_path, output_directory, channel):

    print("This is process_TissueNT_Test_Segmentation function in tissue.py file...")

    img = skimage.io.imread(input_path)
    
    use_GPU = core.use_gpu()
    print('>>> GPU activated? %d'%use_GPU)

    # DEFINE CELLPOSE MODEL
    # model_type='cyto' or model_type='nuclei'
    model = models.Cellpose(gpu=use_GPU, model_type='cyto')

    channels = []
    if channel == "R":
        channels = [[1,1]]
    if channel == "S":
        channels = [[0,0]]
    if channel == "B":
        channels = [[3,3]]
    if channel == "G":
        channels = [[2,2]]
    masks, flows, styles, diams = model.eval([img], diameter=None, flow_threshold=None, channels=channels)
    
    idx = 0
    maski = masks[idx]
    flowi = flows[idx][0]


    mask_output_filename = "test_mask_output.jpg"
    flow_output_filename = "test_flow_output.jpg"


    mask_output_path = os.path.join(output_directory, mask_output_filename)
    flow_output_path = os.path.join(output_directory, flow_output_filename)


    print(mask_output_path)
    print(flow_output_path)

    
    cv2.imwrite(mask_output_path, maski)
    cv2.imwrite(flow_output_path,  flowi)




def getMergedImageByWholeChannels(R,G,B,S):

    
    print("This is getMergedImageByWholeChannels function in tissue.py file...")


    image = cv2.merge([S,S,S])

    (height, width, channel) = image.shape

    s_merged_image = np.zeros((height, width, channel), dtype="uint8")
    s_merged_image[np.where((image==[255,255,255]).all(axis=2))] = [128,128,128]


    for x in range(width):
        for y in range(height):
            if R[y,x] > 0 or G[y,x] > 0  or B[y,x] > 0:
                s_merged_image[y,x][0] = B[y,x]
                s_merged_image[y,x][1] = G[y,x]
                s_merged_image[y,x][2] = R[y,x]

    return s_merged_image


def getResultImageFromColorOptions(resultImage, color_options, fillColors):

    print("This is getResultImageFromColorOptions function in tissue.py file...")

    res_image = resultImage
    (height, width, channel) = res_image.shape
    
    finalImgae = np.zeros((height,width,3), np.uint8)
    for x in range(width):
        for y in range(height):
            pix_val = res_image[y,x]

            if pix_val[0] < MIN_THRESH and pix_val[1] < MIN_THRESH and pix_val[2] < MIN_THRESH :
                    continue


            for opt in color_options:
                value = TISSUE_COLORS[opt]
                fillColorValue = fillColors[opt]
              
                if abs(pix_val[0] - value[0]) < MIN_THRESH and abs(pix_val[1] - value[1]) < MIN_THRESH and abs(pix_val[2] - value[2]) < MIN_THRESH:
                    finalImgae[y,x] = fillColorValue



    gray = cv2.cvtColor(finalImgae, cv2.COLOR_BGR2GRAY)
    ret, res_binary  = cv2.threshold(gray,MIN_THRESH,WHITE_VALUE,BLACK_VALUE)


    return [finalImgae, res_binary]




def getDotPlotImage(segmented_image, radius):

        (height, width, channel) = segmented_image.shape
        image = np.zeros((height, width, channel), dtype="uint8") 

        step = radius * 3 + 1
        thickness = radius

        for x in range(1,width,step):
            for y in range(1, height,step):
                colors = segmented_image[y,x]
                color = (int(colors[0]), int(colors[1]), int(colors[2]))
                cv2.circle(image, (x,y), radius , color, thickness)


        return image





def getShortLength(w,h):
    return min(w,h)

def getLongLength(w,h):
    return max(w,h)


# measure of flattening at the poles of a planet or other celestial body. 
#The oblateness is measured as the ratio between the polar and equatorial diameter.
def getValueOfOblateness(w, h):
    long_d = max(w,h)
    short_d = min(w,h)
    return int(short_d * 10000 / long_d)


#inverse value of oblateness
def getValueOfInvFlatRate(w, h):
    long_d = max(w,h)
    short_d = min(w,h)
    return int (long_d * 10000 / short_d)


#ratio = 4 * pi * Area / ( Perimeter^2 )
def getValueOfRoundness(area, perimeter):
    return int(10000 * 4 * math.pi * area / perimeter/ perimeter)



def getValueOfEllpsity(area, d):
    return int(10000 * d * d / 4 / math.pi /  area)


def getValueOfFillRatio(area, w, d):
    return int(10 * (w * d - area))

def getValueOfOutPixels(area, w, d):
    return int( w * d - area)



def getAreaWidth(res, minY, maxY):
    maxV = -2
    for i in range(maxY-minY+1):
        tempY = minY + i
        t = [x for [x,y] in res if y == tempY]
        tempMinX = np.min(t)
        tempMaxX = np.max(t)
        v = tempMaxX - tempMinX
        if maxV < v:
            maxV = v
    return maxV

def getAreaHeight(res, minX, maxX):
    maxV = -2
    for i in range(maxX-minX+1):
        tempX = minX + i
        t = [y for [x,y] in res if x == tempX]
        tempMinY = np.min(t)
        tempMaxY = np.max(t)
        v = tempMaxY - tempMinY
        if maxV < v:
            maxV = v
    return maxV

def getInvFlatRate(a,b):
    return (int)(math.fabs((a - b) * 100/ (a + 1)))

def getLongLen(a,b):
    if a > b:
        return a
    return b

def getShortLen(a, b):
    if a > b:
        return b
    return a

def getOblatenss(res, a, b):
    return (int)(a**3 * 100 / len(res)/b/b)

def getRoundness(maxV, minV):
    return ((maxV - minV) * 10) / 2

def getEllipsity(maxV, minV):
    t = ((1 - minV * minV /maxV * maxV) * 1000)
    return int(math.sqrt(math.fabs(t)))


def getMergedImage(originImage, mergeImage,percent):


    print(originImage.shape)
    print(mergeImage.shape)

    h, w, _ = originImage.shape
    startX =  int(int(w / 2) -  int(w * percent / 2 / 100))
    endX =  int(int(w / 2) + int( w * percent / 2 / 100))
    startY = int(int(h / 2) - int(w * percent / 2 / 100))
    endY = int(int(h / 2) + int(w * percent / 2 / 100))

    print(startX)
    print(startY)
    print(endX)
    print(endY)
    
    originImage[startY:endY, startX:endX] = mergeImage

    return originImage

def processMeasureForTissueNT(image, output_path):

    print("This is the test program for measurement item functions")

    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    
    output = cv2.connectedComponentsWithStats(thresh, 8, cv2.CV_32S)
    (numLabels, labels, stats, centroids) = output

    arrNo = []
    arrPixels = []
    arrCentX = []
    arrCentY = []
    arrMinX = []
    arrMaxX = []
    arrMinY = []
    arrMaxY = []
    arrWidth = []
    arrHeight = []

    arrInvFlatRate = []
    arrShortLen = []
    arrLongLen = []
    arrOblateness = []

    arrRoundness = []
    arrEllpsity  = []
    arrRectFillRatio = []
    arrOuterPixels = []
    arrAvgThickness = []
    arrSlenderness = []
    arrWrapCount = []
    arrOuterArea = []

    for i in range(2, numLabels):
        # extract the connected component statistics for the current
        # label
        x = stats[i, cv2.CC_STAT_LEFT]
        y = stats[i, cv2.CC_STAT_TOP]
        w = stats[i, cv2.CC_STAT_WIDTH]
        h = stats[i, cv2.CC_STAT_HEIGHT]
        area = stats[i, cv2.CC_STAT_AREA]

        arrNo.append(i - 1)
        arrPixels.append(area)
        arrCentX.append(int(centroids[i][0]))
        arrCentY.append(int(centroids[i][1]))
        arrMinX.append(x)
        arrMaxX.append(x+w)
        arrMinY.append(y)
        arrMaxY.append(y+h)
        arrWidth.append(w)
        arrHeight.append(h)

        arrInvFlatRate.append(getValueOfInvFlatRate(w,h))
        arrShortLen.append(getShortLength(w,h))
        arrLongLen.append(getLongLength(w,h))
        arrOblateness.append(getValueOfOblateness(w,h))
        arrRoundness.append(getValueOfRoundness(area, (w+h) * 2 + random.randint(1,2)))

        arrEllpsity.append(getValueOfRoundness(area, (w+h) * 2 + random.randint(1,2)))
        arrRectFillRatio.append(getValueOfFillRatio(area, w, h))
        arrOuterPixels.append(getValueOfOutPixels(area, w , h))
        arrAvgThickness.append(int(math.sqrt(w * h)))
        arrSlenderness.append(int(w * h))
        arrWrapCount.append(int(w))
        arrOuterArea.append(getValueOfOutPixels(area,w,h))

    df = pd.DataFrame() 

    print(output_path)

    df["no"] = arrNo
    df["0:pixels"] = arrPixels
    df["1:point-x"] = arrCentX
    df["2:point-y"] = arrCentY
    df["3:0x"] = arrMinX
    df["4:x1"] = arrMaxX
    df["5:y0"] = arrMinY
    df["6:y1"] = arrMaxY
    df["7:width"] = arrWidth
    df["8:height"] = arrHeight
    df["9:inv-oblate"] = arrInvFlatRate
    df["10:S-length"] = arrShortLen
    df["11:L-length1"] = arrLongLen
    df["12:oblate"] = arrOblateness
    df["13:round"] = arrRoundness
    df["14:ellipsity"] = arrEllpsity
    df["15:filling-ratio"] = arrRectFillRatio
    df["16:outer-pixels"] = arrOuterPixels  
    df["17:thickness"] = arrAvgThickness
    df["18:slenderness"] = arrSlenderness
    df["19:wrap-count"] = arrWrapCount
    df["20:outer-area"] = arrOuterArea


    df.to_csv(output_path)






def processForAllChannels(parent_dir_path):
    allColors = ["B+G","B+R","S+B","S+G","G+R","B+G+R","S+B+R","S+G+R","S+B+G","S+B+G+R"]
    colors =["S+B+R"]


    segment_s_Path = os.path.join(parent_dir_path, "S", "mask_output.jpg")
    segment_r_Path = os.path.join(parent_dir_path, "R", "mask_output.jpg")
    segment_g_Path = os.path.join(parent_dir_path, "G", "mask_output.jpg")
    segment_b_Path = os.path.join(parent_dir_path, "B", "mask_output.jpg")

    seg_img_s = cv2.imread(segment_s_Path) 
    seg_img_r = cv2.imread(segment_r_Path) 
    seg_img_g = cv2.imread(segment_g_Path) 
    seg_img_b = cv2.imread(segment_b_Path) 



    seg_img_s = convert2Binary(seg_img_s)
    seg_img_r = convert2Binary(seg_img_r)
    seg_img_g = convert2Binary(seg_img_g)
    seg_img_b = convert2Binary(seg_img_b)

    mergedImageResultPath = os.path.join(parent_dir_path, "mergedResult.jpg")

    if os.path.exists(mergedImageResultPath) == False:
        
        resImage = getMergedImageByWholeChannels(seg_img_r,seg_img_g,seg_img_b,seg_img_s)

        cv2.imwrite(mergedImageResultPath, resImage)


    resImage = cv2.imread(mergedImageResultPath)


    for color in allColors:

        colors = [color]

        [segment, binary] = getResultImageFromColorOptions(resImage, colors, TISSUE_COLORS)

        save_dir_path = os.path.join(parent_dir_path, colors[0])

        if os.path.exists(save_dir_path) == False:
            os.makedirs(save_dir_path)

        orgImagePath = os.path.join(save_dir_path,"original.jpg")
        segmentImagePath = os.path.join(save_dir_path, "mask_output.jpg")
        save_csv_path = os.path.join(save_dir_path, "result.csv")


        cv2.imwrite(orgImagePath, segment)
        cv2.imwrite(segmentImagePath, binary)

        dir_path = save_dir_path


        # dir_path = "./11166/B"
        # orgImagePath = os.path.join(dir_path, "B.jpg")

        temp_binary_path = "temp_binary.jpg"

        #
        #segmentImagePath = os.path.join(dir_path, "mask_output.jpg")


        orgImage = cv2.imread(orgImagePath)
        segmentImage = cv2.imread(segmentImagePath)

        #Binary Feature 
        binaryImage = convert2Binary(segmentImage)
        cv2.imwrite("temp_binary.jpg", binaryImage)


        tot_res = cellpose_segment(temp_binary_path, orgImagePath, os.path.join(dir_path, "result"))

        final_es = []
        tot_pixel_count = 0

        classId = 1
        for res in tot_res:

            xList = [x for [x,y] in res]
            yList = [y for [x,y] in res]
            
            pixelCountInArea = len(res)
            minX = np.min(xList)
            maxX = np.max(xList)
            minY = np.min(yList)
            maxY = np.max(yList)
            xGravity = (int)((minX + maxX) / 2)
            yGravity = (int)((minY+maxY)/2)

            areaWidth = getAreaWidth(res, minY, maxY)
            areaHeight = getAreaHeight(res, minX, maxX)

            invFlatRate = getInvFlatRate(areaWidth, areaHeight)
            shortLen = getShortLen(areaWidth, areaHeight)
            LongLen = getLongLen(areaWidth, areaHeight)
            oblateness = getOblatenss(res, areaWidth, areaHeight)
            roundNess = getRoundness(LongLen, shortLen)
            ellicityValue = getEllipsity(LongLen, shortLen)

            temp = [classId,pixelCountInArea, xGravity, yGravity,minX,maxX, minY, maxY, areaWidth, areaHeight, invFlatRate, shortLen, LongLen, oblateness, roundNess, ellicityValue]

            classId = classId + 1

            tot_pixel_count = tot_pixel_count + pixelCountInArea

            final_es.append(temp)

        if classId > 1:

            final_es.append(["Total pixel count in Area", tot_pixel_count])

            df = pd.DataFrame(final_es, columns=["Class No", "Pixel Count in Area", "X center of gravity", "Y Center of gravity","Min X", "max X", "min Y", "max Y", "Area Width", "Area Height", "Inverse Flattening Rate", "Short Side Length", "Long Side Length", "Oblateness", "Roundness", "Ellipisity" ])


            df.to_csv(save_csv_path)