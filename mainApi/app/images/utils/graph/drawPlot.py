from scipy.stats import gaussian_kde
import matplotlib.pyplot as plt
import pandas as pd
from random import random as getValue
from sklearn.preprocessing import StandardScaler
import numpy as np
import cv2
#from matplotlib import colormaps
#print(list(colormaps))

INPUT_CSV_PATH = "mainApi/ml_lib/sample.ome_300.csv"

def saveHeatmap(input_path, output_path,x_index, y_index, cmap = "jet"):
    data = pd.read_csv(INPUT_CSV_PATH)

    headers = []
    for col in data.columns:
        headers.append(col)

    data = data.dropna()
    
    x = data[
        headers[x_index]
    ].values

    y = data[
        headers[y_index]
    ].values

    s_max = max(max(x), max(y))

    x = x / max(x) * s_max * 3
    y = y / max(y) * s_max * 3

    s_len = 3000


    x = x.tolist()
    y = y.tolist()

    for i in range(s_len):  
        x.append(getValue() * s_max)
        y.append(getValue() * s_max)
    
    xy = np.vstack([x,y])
    z = gaussian_kde(xy)(xy)

    fig, ax = plt.subplots()
    ax.scatter(x, y, c=z, s=6,cmap =cmap)
    plt.savefig(output_path)

    #plt.show()
def addROIInHeatMapImage(input_path, output_path, roi_area):
    image = cv2.imread(input_path)

    h,w,c = image.shape

    start_point = (int(w * roi_area[0] / 100), int(h * roi_area[2] / 100)) 
    end_point = (int(w * roi_area[1] / 100), int(h * roi_area[3] / 100)) 

    # Blue color in BGR 
    color = (255, 0, 0) 
    
    # Line thickness of 2 px 
    thickness = 2
    
    # Using cv2.rectangle() method 
    # Draw a rectangle with blue line borders of thickness of 2 px 
    image = cv2.rectangle(image, start_point, end_point, color, thickness) 

    cv2.imwrite(output_path, image)


# saveHeatmap(input_path, "1.png",3,12)
# saveHeatmap(input_path, "2.png",2,4)
# saveHeatmap(input_path, "3.png",2,13,'cividis' )
# saveHeatmap(input_path, "4.png",4,15,'magma' )
# saveHeatmap(input_path, "5.png",8,17,'gist_gray_r' )