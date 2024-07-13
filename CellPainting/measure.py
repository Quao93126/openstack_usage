


import os
import numpy as np
import time, os, sys
from urllib.parse import urlparse

import cv2
import math
import random
import pandas as pd
import mahotas

from basic import *



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



def get_angle_angle_values(xpoints, ypoints, size):
    temp = []
    for i in range(size):
        if(i == 0) :
            p1 = Point(xpoints[size-1], ypoints[size-1])
            p2 = Point(xpoints[i], ypoints[i])
            p3 = Point(xpoints[i+1],ypoints[i+1])
        elif (i == size-1):
            p3 = Point(xpoints[0], ypoints[0])
            p2 = Point(xpoints[i], ypoints[i])
            p1 = Point(xpoints[i-1],ypoints[i-1])
        else :
            p2 = Point(xpoints[i], ypoints[i])
            p1 = Point(xpoints[i-1],ypoints[i-1])
            p3 = Point(xpoints[i+1],ypoints[i+1])
        temp.append(angle_Angle_Between_Three_Points(p1,p2,p3))
    return temp



def get_angle_radius_values(xpoints, ypoints, size):
    temp = []

    for i in range(size):
        if(i == 0) :
            p1 = Point(xpoints[size-1], ypoints[size-1])
            p2 = Point(xpoints[i], ypoints[i])
            p3 = Point(xpoints[i+1],ypoints[i+1])
        elif (i == size-1):
            p3 = Point(xpoints[0], ypoints[0])
            p2 = Point(xpoints[i], ypoints[i])
            p1 = Point(xpoints[i-1],ypoints[i-1])
        else :
            p2 = Point(xpoints[i], ypoints[i])
            p1 = Point(xpoints[i-1],ypoints[i-1])
            p3 = Point(xpoints[i+1],ypoints[i+1])
        temp.append(angle_Radius(p1,p2,p3))
    return temp


def get_bestfit_mean_values(long_lengths, short_lenghts, size):
    temp = []
    for i in range(size):
        temp.append((long_lengths[i] + short_lenghts[i]) / 2)
    return temp


def get_bestfit_rmse_values(long_lengths, short_lenghts, size):
    temp = []
    for i in range(size):
        temp.append(math.sqrt(long_lengths[i] * short_lenghts[i]) )
    return temp


def get_line_angle_values(values_x1, values_y1, values_x2, values_y2, total_size):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        angle = line_Angle(Line(stPoint, enPoint))
        temp.append(angle)
    return temp


def  get_line_arc_angle(values_center_x,values_center_y,values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        centerPoint = Point(values_center_x[i], values_center_y[i])
        angle = angle_Angle_Between_Three_Points(stPoint, centerPoint, enPoint)
        temp.append(angle)
    return temp


def  get_line_arc_radius(values_center_x,values_center_y,values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        centerPoint = Point(values_center_x[i], values_center_y[i])
        radius = angle_Radius(stPoint, centerPoint, enPoint)
        temp.append(radius)
    return temp

def get_line_chord_length(total_size):
    temp = []
    for i in range(total_size):
        temp.append(0)
    return temp


def get_line_endX(values_x1, values_y1, values_x2, values_y2, total_size ):
    return values_x2


def get_line_endY(values_x1, values_y1, values_x2, values_y2, total_size ):
    return values_y2

def get_line_startX(values_x1, values_y1, values_x2, values_y2, total_size ):
    return values_x1

def get_line_startY(values_x1, values_y1, values_x2, values_y2, total_size ):
    return values_y1

def get_line_endXY(values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        value_xy = line_EndXY(Line(stPoint, enPoint))
      
        temp.append(value_xy)
    return temp


def get_line_startXY(values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        value_xy = line_StartXY(Line(stPoint, enPoint))
        temp.append(value_xy)
    return temp

def get_line_length(values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        value = line_Length(Line(stPoint, enPoint))
        temp.append(value)
    return temp

def get_line_positionX(values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        value = line_PositionX(Line(stPoint, enPoint))
        temp.append(value)
    return temp

def get_line_positionXY(values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        value = line_PositionXY(Line(stPoint, enPoint))
        temp.append(value)
    return temp

def get_line_positionY(values_x1, values_y1, values_x2, values_y2, total_size ):
    temp = []
    for i in range(total_size):
        stPoint = Point(values_x1[i], values_y1[i])
        enPoint = Point(values_x2[i], values_y2[i])
        value = line_PositionY(Line(stPoint, enPoint))
        temp.append(value)
    return temp


def get_object_class(total_size):
    temp = []
    for i in range(total_size):
        temp.append(1)
    return temp

def get_object_classname(total_size):
    temp = []
    for i in range(total_size):
        temp.append(1)
    return temp

def get_object_parent(total_size):
    temp = []
    for i in range(total_size):
        temp.append(1)
    return temp



def get_region_centerXY(values_x, values_y,total_size):
    temp = []
    for i in range(total_size):
        value = (values_x[i] + values_y[i]) / 2
        temp.append(value)
    return temp


def get_region_intensity(total_size):
    temp = []
    for i in range(total_size):
        temp.append(1)
    return temp


def get_region_percent(total_size):
    temp = []
    for i in range(total_size):
        temp.append(1)
    return temp


def get_region_perimeter(total_size):
    temp = []
    for i in range(total_size):
        temp.append(1)
    return temp




def processMeasure(image, output_path):

    print("This is the test program for measurement item functions")

    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    
    output = cv2.connectedComponentsWithStats(thresh, 8, cv2.CV_32S)
    (numLabels, labels, stats, centroids) = output

    arrNo = []
    arrPixels = []
    arrCentX = []
    arrCentY = []
    arrCentZ = []

    
    arrMinX = []
    arrMaxX = []
    arrMinY = []
    arrMaxY = []
    arrWidth = []
    arrHeight = []

    arrCompactness = []
    arrEccentricity = []

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
        arrCentZ.append(0)
        arrMinX.append(x)
        arrMaxX.append(x+w)
        arrMinY.append(y)
        arrMaxY.append(y+h)
        arrWidth.append(w)
        arrHeight.append(h)

        size = w * h
        compactness = math.sqrt(size / area)
        arrCompactness.append(compactness)


        # # computing eccentricity value
        # value = mahotas.features.eccentricity(labels[labels == i])
        # arrEccentricity.append(value)

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

    df["no"] = arrNo
    df["Cells_AreaShape_Area"] = arrPixels
    df["Cells_AreaShape_Center_X"] = arrCentX
    df["Cells_AreaShape_Center_Y"] = arrCentY
    df["Cells_AreaShape_Center_Z"] = arrCentZ
    df["Cells_AreaShape_Compactness"] = arrCompactness
    #df["Cells_AreaShape_Eccentricity"] = arrEccentricity
    df["Cells_AreaShape_Minimum_X"] = arrMinX
    df["Cells_AreaShape_Maximum_X"] = arrMaxX
    df["Cells_AreaShape_Minimum_Y"] = arrMinY
    df["Cells_AreaShape_Maximum_X"] = arrMaxY
    df["Cells_AreaShape_Width"] = arrWidth
    df["Cells_AreaShape_Height"] = arrHeight
    df["Cells_AreaShape_Inverse"] =  arrInvFlatRate
    df["Cells_AreaShape_ShortLength"] = arrShortLen
    df["Cells_AreaShape_LongLength"] = arrLongLen
    df["Cells_AreaShape_Oblateness"] = arrOblateness
    df["Cells_AreaShape_Roundness"] = arrRoundness
    df["Cells_AreaShape_Ellipticity"] = arrEllpsity
    df["Cells_AreaShape_RectFillRatio"] = arrRectFillRatio
    df["Cells_AreaShape_OuterPixels"] = arrOuterPixels
    df["Cells_AreaShape_AvgThickness"] = arrAvgThickness
    df["Cells_AreaShape_Slenderness"] = arrSlenderness
    df["Cells_AreaShape_WrapCount"] = arrWrapCount

    total_size = len(arrNo)
    values_angle_angle = get_angle_angle_values(arrCentX, arrCentY, total_size)
    df['Cells_AreaShape_Angle_Angle'] = values_angle_angle

    df['Cells_AreaShape_Angle_CenterX'] = arrCentX
    df['Cells_AreaShape_Angle_CenterY'] = arrCentY
    
    #get the angle radius
    values_angle_radius = get_angle_radius_values(arrCentX, arrCentY, total_size)
    df['Cells_AreaShape_Angle_Radius'] = values_angle_radius
    
    df['Cells_AreaShape_Bestfit_Maxdist'] = arrLongLen
    df['Cells_AreaShape_Bestfit_Mindist'] = arrShortLen

     #get the mean length 
    df['Cells_AreaShape_Bestfit_Meandist'] = get_bestfit_mean_values(arrLongLen, arrShortLen, total_size)

    #get the rmse lenght
    df['Cells_AreaShape_Bestfit_Meandist_Rmsedist'] = get_bestfit_rmse_values(arrLongLen, arrShortLen, total_size)

      #get the line angle with the horizontal line, This line is defined by min point and maxpoint
    values_line_angle = get_line_angle_values(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Line_Angle'] = values_line_angle


    #line arc angle.
    #This will be the angle between the start, end point of the line and center point of the area

    values_line_arc_angle = get_line_arc_angle(arrCentX,arrCentY,arrMinX, arrMinY, arrMaxX, arrMaxY, total_size  )
    df['Cells_AreaShape_Line_Arc_Angle'] = values_line_angle

    df['Cells_AreaShape_Line_Arc_CenterX'] = arrCentX
    df['Cells_AreaShape_Line_Arc_CenterY'] = arrCentY

    df['Cells_AreaShape_Line_Arc_Radius'] = get_line_arc_radius(arrCentX,arrCentY,arrMinX, arrMinY, arrMaxX, arrMaxY, total_size )

    #This function is not implmented yet
    df['Cells_AreaShape_Line_Chord_Length'] = get_line_chord_length(total_size)


    df['Cells_AreaShape_Line_EndX'] = get_line_endX(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size )
    df['Cells_AreaShape_Line_EndY'] = get_line_endY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Line_EndXY'] = get_line_endXY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)

    df['Cells_AreaShape_Line_Length'] = get_line_length(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)

    df['Cells_AreaShape_Line_PositionX'] = get_line_positionX(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Line_PositionXY'] = get_line_positionXY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Line_PositionY'] = get_line_positionY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)

    df['Cells_AreaShape_Line_StartX'] = get_line_startX(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size )
    df['Cells_AreaShape_Line_StartXY'] = get_line_startXY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Line_StartY'] = get_line_startY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
   

    df['Cells_AreaShape_Object_Class'] = get_object_class(total_size)
    df['Cells_AreaShape_Object_Classname'] = get_object_classname(total_size)
    df['Cells_AreaShape_Object_Classparent'] = get_object_parent(total_size)


    df['Cells_AreaShape_Point_Intensity'] = arrAvgThickness

    df['Cells_AreaShape_Point_LocationX'] = get_line_positionX(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Point_LocationXY'] = get_line_positionXY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)
    df['Cells_AreaShape_Point_LocationY'] = get_line_positionY(arrMinX, arrMinY, arrMaxX, arrMaxY, total_size)


    df['Cells_AreaShape_Region_Area'] = arrLongLen
    df['Cells_AreaShape_Axis_Major'] = arrLongLen
    df['Cells_AreaShape_Axis_Minor'] = arrShortLen

    df['Cells_AreaShape_Region_CenterX'] = arrCentX
    df['Cells_AreaShape_Region_CenterXY'] = get_region_centerXY(arrCentX,arrCentY,total_size)
    df['Cells_AreaShape_Region_CenterY'] = arrCentY

    df['Cells_AreaShape_Region_Direction'] = arrLongLen

    df['Cells_AreaShape_Region_Intensity'] = get_region_intensity(total_size)
    df['Cells_AreaShape_Region_Area_Percent'] = get_region_percent(total_size)
    df['Cells_AreaShape_Region_Perimeter'] = get_region_perimeter(total_size)





        





    df.to_csv(output_path, index=False)




image = cv2.imread("./maskes.jpg")
processMeasure(image, "./result.csv" ) 