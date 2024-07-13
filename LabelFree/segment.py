from stardist.models import StarDist2D
from cellpose import models
# prints a list of available models
StarDist2D.from_pretrained()

import numpy as np

# creates a pretrained model
model = StarDist2D.from_pretrained('2D_versatile_fluo')

import cv2
from stardist.data import test_image_nuclei_2d
from stardist.plot import render_label
from csbdeep.utils import normalize
import matplotlib.pyplot as plt

model_dict = {
    'nuclei_only': "./assets/models/nuclei_only",
    'tatiana_label': "./assets/models/retrained_tatiana",
}

def crop_section_and_resize(img: np.ndarray, crop_x: int = 7, crop_y: int = 7, resize_shape = (512, 512), resize=False):
    '''
    from an original image, we crop sections of it, and return it in a list
    args:
        img: cv2 image, np.ndarray
        crop_x: int, number of x-sections to crop
        crop_y: int, number of y-sections to crop
    '''
    h, w, _ = img.shape
    h_section = int(h/crop_y)
    w_section = int(w/crop_x)

    cropped_pieces = []
    for x in range(crop_x):
        for y in range(crop_y):
            y1 = x*w_section
            y2 = (x+1)*w_section
            x1 = y*h_section

            x2 = (y+1)*h_section
            section = img[x1:x2, y1:y2]
            if resize:
                section = cv2.resize(section, resize_shape)
            cropped_pieces.append(section)

    return cropped_pieces

def get_prediction(img1, cellprob_threshold=1):
    model_path = model_dict['tatiana_label']
    model = models.CellposeModel(pretrained_model=model_path)
    flow_threshold = 1
    diameter = 0
    segment_channel = 2
    channels = [segment_channel, 0]
    masks, flows, styles = model.eval(img1, diameter=diameter, flow_threshold=flow_threshold, cellprob_threshold=cellprob_threshold, channels=channels)
    return flows[0]


def process_image(img_filename):
    img = cv2.imread(img_filename)

    crop_x = 2
    crop_y = 2
    
    cropped_sections = crop_section_and_resize(img, crop_x=crop_x, crop_y=crop_y)

    prediction_res = []
    for section in cropped_sections:
        prediction = get_prediction(section)
        prediction_res.append(prediction)
        # cv2.imwrite(f'{idx}_prev.jpg', prediction)
        # idx = idx + 1

    combined = None
    row_idx = [j * crop_y for j in range(crop_y)]
    for y, r in zip(range(crop_y), row_idx):
        curr_row = None
        for x in range(crop_x):
            img_idx = r+x
            subsection = prediction_res[img_idx]
            if curr_row is None:
                curr_row = subsection 
            else:
                curr_row = cv2.vconcat([curr_row, subsection])
        if combined is None:
            combined = curr_row

        else:
            combined = cv2.hconcat([combined, curr_row])

    cv2.imwrite('result.png', combined)


process_image("./crop.PNG")
