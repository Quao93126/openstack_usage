
from cellpose import models

def predict_mask(
        img,
        model_path = "/app/mainApi/app/images/utils/cellpose/assets/models/retrained_tatiana",
        segment_channel = 2,  # i used green channel for all my experiments
        diameter = 0,  # auto predict diameter
        flow_threshold = 0.8,   # however, since the company is only interested in the segmentation, this param is not important
        cellprob_threshold = 1,  # based on the brute forse results, this best param to use for the set of data that was provided to me was 1
    ):
    """
    Function to predict image mask

    Args:
        img: cv2 image
        model_path: str, cellpose model path
        segment_channel: int
        diameter: int
        flow_threshold: float
        cellpose_threshold: int
    """
    channels = [segment_channel,0]
    model = models.CellposeModel(pretrained_model=model_path)

    masks, flows, _ = model.eval(
        img, 
        diameter=diameter, 
        flow_threshold=flow_threshold, 
        cellprob_threshold=cellprob_threshold, 
        channels=channels
    )
    # the mask uses 0 as its background, and then incrementally uses the next numbers as individual cell masks

    return masks, flows