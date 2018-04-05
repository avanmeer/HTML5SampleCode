$(document).ready(function () {

    //Convert checkbox to switch type
    $('input[type="checkbox"]').not('#create-switch').bootstrapSwitch();

    //These variables are for capturing images using webcam.
    //The images captured should be copied to the canvas to keep their resolutions.
    var video = document.querySelector('#webcam');
    var capturedcanvas = document.querySelector('#captured-canvas');
    var blankCanvas = document.querySelector('#blank-canvas');
    var blankContext = blankCanvas.getContext('2d');
    var selectedCanvas = document.querySelector('#selected-canvas');
    var contextCapturedCanvas = capturedcanvas.getContext('2d');


    if (isMobile.any()) {
        $("#option-source").hide();
        $("#container-camera").show();
        $("#container-webcam").hide();
        $('#chkPreProcessing').bootstrapSwitch('setState', true);
    }
    else {

        //Change to .show() to enable webcam feature.
        $("#option-source").hide();

        //Remove comment to enable webcam feature
        //Prompts the user for permission to use a webcam.
        //        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        //        if (navigator.getUserMedia) {
        //            navigator.getUserMedia
        //                            (
        //                              { video: true },
        //                              function (localMediaStream) {
        //                                  video.src = window.URL.createObjectURL(localMediaStream);
        //                              }, onFailure);
        //        }

        //        $("#help-icon").tooltip({ placement: 'bottom' });
        //        $('#chkPreProcessing').bootstrapSwitch('setState', false);
    }

    //Toggles UI between using fileupload or webcam as image input
    var isSourceCameraOrDisk = $('#chkImageSource').is(':checked') ? true : false;
    if (isSourceCameraOrDisk) {
        $("#container-camera").show();
        $("#container-webcam").hide();
    }
    else {
        $("#container-camera").hide();
        $("#container-webcam").show();
    }

    //Toggles UI between using fileupload or webcam when the checkbox has been changed.
    $("#chkImageSource").change(function () {
        if (this.checked) {
            $("#container-camera").show()
            $("#container-webcam").hide()
        }
        else {
            $("#container-camera").hide()
            $("#container-webcam").show()
        }
    });

    function onFailure(err) {
        //The developer can provide any alert messages here once permission is denied to use the webcam.
    }

    function cloneCanvas(oldCanvas) {

        //create a new canvas
        var newCanvas = document.querySelector('#selected-canvas');
        var context = newCanvas.getContext('2d');

        //set dimensions
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;

        //apply the old canvas to the new one
        context.drawImage(oldCanvas, 0, 0);

        //return the new canvas
        return newCanvas;
    }

    //Display the image to the canvas upon capturing image from webcam.
    function snapshot() {
        capturedcanvas.width = video.videoWidth;
        capturedcanvas.height = video.videoHeight;
        contextCapturedCanvas.drawImage(video, 0, 0);
    }

    // Convert dataURL to Blob object
    function dataURLtoBlob(dataURL) {
        // Decode the dataURL    
        var binary = atob(dataURL.split(',')[1]);
        // Create 8-bit unsigned array
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        // Return our Blob object
        return new Blob([new Uint8Array(array)], { type: 'image/jpg' });
    }

    //Clears populated controls. Prepares UI for next processing.
    function ResetControls() {
        $("#reformatted-image").attr("src", "http://www.placehold.it/350x120/EFEFEF/AAAAAA&text=no+image");
        $("#main-image").attr("src", "http://www.placehold.it/507x318/EFEFEF/AAAAAA&text=Tap+Here");

        $('#extractedData').hide();
        $('#barcode-data').empty();
    };

    //Accept captured image from webcam and display on canvas.
    $("#btn-use-image").click(function () {
        cloneCanvas(capturedcanvas);
        $('#myModal').modal("hide");
        $("#div-controls").show();
    });

    //Clicks on webcam area to capture image.
    $("#webcam").click(function () {
        snapshot();
        $('#myModal').modal()
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image").click(function () {
        $("#input-image").click();
        $('#extractedData').hide();
        $('#barcode-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail").click(function () {
        $("#input-image").click();
        $('#extractedData').hide();
        $('#barcode-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container").fileupload("clear");
    });

    var preprocessedImage;
    var unmodifiedImage;
    //Resize image
    $('#input-image').change(function (e) {

        var file = e.target.files[0];

        canvasResize(file, {
            crop: false,
            quality: 75,
            isiOS: isMobile.iOS(),
            isPreprocessing: true,
            cardType: "Barcode",
            callback: function (data, width, height) {
                preprocessedImage = utilities.DataUrlToBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            cardType: "DriversLicense",
            callback: function (data, width, height) {
                unmodifiedImage = utilities.DataUrlToBlob(data);
            }
        });
    });

    $("#btn-process-image").click(function () {

        ResetControls();
        var isSourceCameraOrDisk = $('#chkImageSource').is(':checked') ? true : false;
        var usePreprocessing = $('#chkPreProcessing').is(':checked') ? true : false;

        var selectedRegion = $("#region-select").val();
        var imageToProcess;
        var imgVal = $('#input-image').val();

        $('#diplay-div').empty();
        $('#div-img').empty();
        $('#errorDiv').empty();
        $('#loading').empty();

        if (isSourceCameraOrDisk) {
            if (imgVal == '') {
                alert("Empty input file.");
                return;
            }

            if (usePreprocessing)
                imageToProcess = preprocessedImage;
            else
                imageToProcess = unmodifiedImage;
        }
        else {
            var dataUrl = selectedCanvas.toDataURL();
            var image = dataURLtoBlob(dataUrl);
            var blankDataUrl = blankCanvas.toDataURL();

            if (dataUrl == blankDataUrl) {
                alert("Capture image first before processing.");
                return;
            }
            imageToProcess = image;
        }

        //Access web service
        var promise = acuantWebservice.ProcessBarcode(imageToProcess, usePreprocessing);

        promise.error(function (response) {

            var error = jQuery.parseJSON(JSON.stringify(response));
            $('#errorDiv').html("Error: " + JSON.stringify(error.status + " " + error.statusText));
        });

        promise.done(function (response) {

            //Convert data to string before parsing
            var barcode = JSON.stringify(response);
            barcode = jQuery.parseJSON(barcode);

            //Checking if there are errors returned.
            if (barcode.ResponseCodeAuthorization < 0) {
                ui.ShowErrorDescription(barcode.ResponseMessageAuthorization);
            }
            else if (barcode.WebResponseCode < 1) {
                ui.ShowErrorDescription(barcode.WebResponseDescription);
            }
            else if (barcode.ResponseCodeProcBarcode <= 0) {
                if (barcode.Results2D > 0) {
                    ui.ShowErrorDescription("2D Barcode found but not read.");
                }
                else {
                    ui.ShowErrorDescription(barcode.ResponseCodeProcBarcodeDesc);
                }
            }
            else {

                //Display data returned by the web service
                var data = ui.DisplayField("Name", barcode.Name);
                data += ui.DisplayField("NameFirst", barcode.NameFirst);
                data += ui.DisplayField("NameMiddle", barcode.NameMiddle);
                data += ui.DisplayField("NameSuffix", barcode.NameSuffix);
                data += ui.DisplayField("NameLast", barcode.NameLast);
                data += ui.DisplayField("license", barcode.license);
                data += ui.DisplayField("IssueDate", barcode.IssueDate);
                data += ui.DisplayField("DateOfBirth", barcode.DateOfBirth);
                data += ui.DisplayField("Address", barcode.Address);
                data += ui.DisplayField("City", barcode.City);
                data += ui.DisplayField("State", barcode.State);
                data += ui.DisplayField("Zip", barcode.Zip);
                data += ui.DisplayField("ExpirationDate", barcode.ExpirationDate);
                data += ui.DisplayField("Class", barcode.Class);
                data += ui.DisplayField("Sex", barcode.Sex);
                data += ui.DisplayField("SocialSecurity", barcode.SocialSecurity);
                data += ui.DisplayField("Eyes", barcode.Eyes);
                data += ui.DisplayField("Hair", barcode.Hair);
                data += ui.DisplayField("Height", barcode.Height);
                data += ui.DisplayField("Weight", barcode.Weight);

                $(data).appendTo("#barcode-data");
                $("#extractedData").show();
            }

            //Display reformatted image on UI
            var reformattedImage = barcode.ReformattedImage;
            if (reformattedImage != null) {
                var base64ReformattedImage = goog.crypt.base64.encodeByteArray(reformattedImage);
                $("#image-thumbnail img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
            }
        });

        promise.always(function () {
            ui.RemoveLoadingIcon();
            $("#div-controls").hide();
        });
    });
});