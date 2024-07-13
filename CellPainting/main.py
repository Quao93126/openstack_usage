import cv2
import numpy as np
from cellpose_segment_util import cellpose_segment



maskImage = cv2.imread("maskes.jpg")

tot_res = cellpose_segment("maskes.jpg")


