$(document).ready(function () {
    $('input[type="checkbox"]').not('#create-switch').bootstrapSwitch();
    $("#rdoFront").prop("checked", true)
    $("#rdoFront").parent().addClass("active");

    //Detect type of device.
    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    //These variables are for capturing images using webcam.
    //The images captured should be copied to the canvas to keep their resolutions.
    var video = document.querySelector('#webcam');
    var capturedcanvas = document.querySelector('#captured-canvas');
    var blankCanvasFront = document.querySelector('#blank-canvas-front');
    var blankContextFront = blankCanvasFront.getContext('2d');
    var selectedCanvasFront = document.querySelector('#selected-canvas-front');
    var selectedCanvasBack = document.querySelector('#selected-canvas-back');
    var contextCapturedCanvas = capturedcanvas.getContext('2d');

    var contextCanvasBack = selectedCanvasBack.getContext('2d');

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
        //                navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        //                if (navigator.getUserMedia) {
        //                    navigator.getUserMedia
        //                                    (
        //                                      { video: true },
        //                                      function (localMediaStream) {
        //                                          video.src = window.URL.createObjectURL(localMediaStream);
        //                                      }, onFailure);
        //                }

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

    $("#div-delete").hide();

    var validCredentials = false;
    checkCredentials();// check the credentials. Especially check if the subscription provided is an active subscription 

    var instanceID = "";

    var AssureIDResultEnum = {
        Unknown: 0,
        Passed: 1,
        Failed: 2,
        Skipped: 3,
        Caution: 4,
        Attention: 5
    };

    function getEnum(Enum, value) {
        for (var k in Enum) if (Enum[k] == value) return k;
        return null;
    }

    function checkCredentials() {
        if (username && password && assureIDConnectEndpoint && subscriptionID) // All the variables should be non empty
        {
            var requestSubscriptions = createCORSRequest("GET", assureIDConnectEndpoint + "/AssureIDService/Subscriptions");
            if (requestSubscriptions) {
                requestSubscriptions.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                requestSubscriptions.setRequestHeader("Accept", "application/json");
                requestSubscriptions.onload = function () {
                    var subscriptions = JSON.parse(requestSubscriptions.responseText);

                    if (subscriptions.length > 0) {
                        var chk = false;
                        // Extract all the data fields and signature and face images

                        for (var i = 0; i < subscriptions.length; i++) {
                            if (subscriptions[i].Id == subscriptionID) {
                                if (subscriptions[i].IsActive == true) {
                                    chk = true;
                                    break;
                                }
                            }

                        }


                        //for (var sub of subscriptions)
                        //{
                        //    if (sub.Id == subscriptionID) {
                        //        if (sub.IsActive == true) {
                        //            chk = true;
                        //            break;
                        //        }
                        //    }
                        //}
                        if (!chk) {
                            alert("Error: The subscription ID provided does not match any active subscription.");
                        }
                        else {
                            validCredentials = true;
                        }
                    }
                    else {
                        alert("Error: No active subscriptions found.");
                    }
                }
                requestSubscriptions.send();
            }
        }
        else {
            alert("Error: Please provide the AssureID credentials in the credentials.js file before running this web page.");
        }
    }
    function onFailure(err) {
        //The developer can provide any alert messages here once permission is denied to use the webcam.
    }

    function cloneCanvas(oldCanvas) {
        var newCanvas;

        if ($("#rdoFront").parent().hasClass("active"))
            newCanvas = document.querySelector('#selected-canvas-front');
        else
            newCanvas = document.querySelector('#selected-canvas-back');
        //create a new canvas
        //var newCanvas = document.createElement('canvas');
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

    //Format data displayed to UI.
    function AddDisplay(fieldName, fieldValue) {

        if (fieldName == "Address Verification" || fieldName == "ID Verification") {
            var string = "<div class=\"form-group\">";
            string += "<label class=\"col-md-4 control-label\">";
            string += fieldName;
            string += "</label>";
            string += "<div class=\"col-md-7\">";
            string += "<p class=\"form-control text-center\">";
            string += fieldValue;
            string += "</p>";
            string += "</div>";
            string += "</div>";
            return string;
        }
        else if (fieldValue) {
            var string = "<div class=\"form-group\">";
            string += "<label class=\"col-md-4 control-label\">";
            string += fieldName;
            string += "</label>";
            string += "<div class=\"col-md-7\">";
            string += "<p class=\"form-control text-center\">";
            string += fieldValue;
            string += "</p>";
            string += "</div>";
            string += "</div>";
            return string;
        }
        else
            return "";
    };

    //Clears populated controls. Prepares UI for next processing.
    function ResetControls() {
        document.getElementById("extractedData").style.display = "none";
        $('#drivers-license-data').empty();
        $("#div-delete").hide();
    };

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

    //Accept captured image from webcam and display on canvas.
    $("#btn-use-image").click(function () {
        cloneCanvas(capturedcanvas);
        $('#myModal').modal("hide");
    });

    //Clicks on webcam area to capture image.
    $("#webcam").click(function () {
        snapshot();
        $('#myModal').modal()
        $("#div-controls").show();
        $("#div-delete").hide();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-front").click(function () {
        $("#input-image-front").click();
        document.getElementById("extractedData").style.display = "none";
        document.getElementById("faceImage").style.display = "none";
        document.getElementById("signImage").style.display = "none";
        $('#medicalcard-data').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#div-delete").hide();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-back").click(function () {
        $("#input-image-back").click();
        document.getElementById("extractedData").style.display = "none";
        document.getElementById("faceImage").style.display = "none";
        document.getElementById("signImage").style.display = "none";
        $('#medicalcard-data').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#div-delete").hide();
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-front").click(function () {
        $("#input-image-front").click();
        document.getElementById("extractedData").style.display = "none";
        document.getElementById("faceImage").style.display = "none";
        document.getElementById("signImage").style.display = "none";
        $('#medicalcard-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#div-delete").hide();
        $("#fileupload-container-back").show();
        $("#container-camera > div > div:first-child").attr('class', 'col-xs-12 col-sm-6 col-lg-6');
        $("#fileupload-container-front").fileupload("clear");
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-back").click(function () {
        $("#input-image-back").click();
        document.getElementById("extractedData").style.display = "none";
        document.getElementById("faceImage").style.display = "none";
        document.getElementById("signImage").style.display = "none";
        $('#medicalcard-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#div-delete").hide();
        $("#fileupload-container-back").fileupload("clear");
    });

    var preprocessedFrontImage;
    var unmodifiedFrontImage;
    //Resize image
    $('#input-image-front').change(function (e) {
        var file = e.target.files[0];

        canvasResize(file, {
            crop: false,
            quality: 75,
            isiOS: isMobile.iOS(),
            isPreprocessing: true,
            cardType: "DriversLicenseDuplex",
            callback: function (data, width, height) {
                preprocessedFrontImage = dataURLtoBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicenseDuplex",
            callback: function (data, width, height) {
                unmodifiedFrontImage = dataURLtoBlob(data);
            }
        });
    });

    var preprocessedBackImage;
    var unmodifiedBackImage;
    //Resize image
    $('#input-image-back').change(function (e) {
        var file = e.target.files[0];

        canvasResize(file, {
            crop: false,
            quality: 75,
            isPreprocessing: true,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicenseDuplex",
            callback: function (data, width, height) {
                preprocessedBackImage = dataURLtoBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicenseDuplex",
            callback: function (data, width, height) {
                unmodifiedBackImage = dataURLtoBlob(data);
            }
        });
    });

    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null;
        }
        return xhr;
    }

    $("#btn-delete-docInstance").click(function () {
        if (instanceID) {
            var deleteDocInstance = createCORSRequest("DELETE", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID);
            deleteDocInstance.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            deleteDocInstance.send();
            deleteDocInstance.onload = function () {
                alert("Document Instance successfully deleted!");
            }
        }
    });

    $("#btn-process-image").click(function () {
        if (validCredentials) {
            ResetControls();
            var isSourceCameraOrDisk = $('#chkImageSource').is(':checked') ? true : false;

            var imageToProcess;
            var imgValFront = $('#input-image-front').val();

            $('#diplay-div').empty();
            $('#div-img').empty();

            $('#errorDiv').empty();
            $('#loading').empty();

            var dataUrl;
            var image;

            if (isSourceCameraOrDisk) {
                if (imgValFront == '') {
                    alert("Front side image required.");
                    return;
                }

                //if (imgValBack == '') {
                //    alert("Back side image required.");
                //    return;
                //}

                //imageToProcess = new FormData();

                //if (cropImg) {
                //    imageToProcess.append("frontImage", preprocessedFrontImage);
                //    if (imgValBack != '') {
                //        imageToProcess.append("backImage", preprocessedBackImage);
                //    }
                //}
                //else {
                //    imageToProcess.append("frontImage", unmodifiedFrontImage);
                //    if (imgValBack != '') {
                //        imageToProcess.append("backImage", unmodifiedBackImage);
                //    }
                //}
            }
            //else {
            //    imageToProcess = new FormData();
            //    dataUrl = selectedCanvasFront.toDataURL();
            //    image = dataURLtoBlob(dataUrl);
            //    var blankDataUrl = blankCanvasFront.toDataURL();

            //    if (dataUrl == blankDataUrl) {
            //        alert("Capture image first before processing.");
            //        return;
            //    }
            //    //imageToProcess = image;
            //    imageToProcess.append("files", image);

            //    dataUrl = selectedCanvasBack.toDataURL();

            //    if (dataUrl == blankDataUrl) {
            //        alert("Capture back image before processing.");
            //        return;
            //    }
            //    else {
            //        image = dataURLtoBlob(dataUrl);
            //        imageToProcess.append("files", image);
            //    }
            //}

            // Show the loading animation
            $('#loading').html("<img src='images/processing.gif'/>");
            $("#div-controls").hide();

            // request a document instance. // All other Web Services calls are nested
            getDocInstance();
        }
        else {
            alert("Error: You do not have valid credentials to call the Web Services.");
        }
    });

    function getDocInstance() {
        //var cropImg = $('#imgCrop').is(':checked') ? 1 : 0;
        var cropImg = $("#imgCrop").val();

        var selectedImgSource = $("#imgSource-select").val();
        var selectedImgSize = $("#imgSize-select").val();

        // request a document instance.
        var requestDocInstance = createCORSRequest("POST", assureIDConnectEndpoint + "/AssureIDService/Document/Instance");
        requestDocInstance.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        requestDocInstance.setRequestHeader('Content-Type', 'application/json');
        requestDocInstance.setRequestHeader("Accept", "application/json");
        requestDocInstance.send(JSON.stringify({
            "AuthenticationSensitivity": 0,
            "ClassificationMode": 0,
            "Device": {
                "HasContactlessChipReader": false,
                "HasMagneticStripeReader": false,
                "SerialNumber": "xxx",
                "Type": {
                    "Manufacturer": "xxx",
                    "Model": "xxx",
                    "SensorType": selectedImgSource
                }
            },
            "ImageCroppingExpectedSize": selectedImgSize,
            "ImageCroppingMode": cropImg,
            "ManualDocumentType": null,
            //{
            //    "Class": 0,
            //    "ClassCode": "String content",
            //    "ClassName": "String content",
            //    "Id": "30a24e86-9a18-423f-9939-533af439ca4f",
            //    "IsGeneric": true,
            //    "Issue": "String content",
            //    "IssueType": "String content",
            //    "IssuerCode": "String content",
            //    "IssuerName": "String content",
            //    "KeesingCode": "String content",
            //    "Name": "String content",
            //    "Size": 0,
            //    "SupportedImages": [
            //      {
            //          "Light": 0,
            //          "Side": 0
            //      }
            //    ]
            //},
            "ProcessMode": 0,
            "SubscriptionId": subscriptionID
        }));
        requestDocInstance.onload = function () {
            instanceID = JSON.parse(requestDocInstance.responseText); // Returns a GUID 

            //Post Front Image
            postFrontImage();
        }
    }

    function postFrontImage() {
        var imgValBack = $('#input-image-back').val();

        var requestPostFrontImg = createCORSRequest("POST", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID + "/Image?side=0&light=0");
        requestPostFrontImg.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        requestPostFrontImg.send(unmodifiedFrontImage);
        requestPostFrontImg.onload = function () { // Front image is successfully loaded
            if (imgValBack != '') {
                postBackImage();
            }
            else {
                getResults();
            }
        }
    }

    function postBackImage() {
        // Back Image
        var requestPostBackImg = createCORSRequest("POST", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID + "/Image?side=1&light=0");
        requestPostBackImg.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        requestPostBackImg.send(unmodifiedBackImage);
        requestPostBackImg.onload = function () { // Back Image is successfully loaded
            getResults();
        }
    }

    function getResults() {
        //var cropImg = $('#imgCrop').is(':checked') ? 1 : 0;
        var cropImg = $("#imgCrop").val();
        
        var imgValBack = $('#input-image-back').val();

        // Request document object which will contain both AcuFill and AssureID results 
        var requestGetDocument = createCORSRequest("GET", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID);
        requestGetDocument.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        requestGetDocument.setRequestHeader("Accept", "application/json");
        requestGetDocument.send();
        requestGetDocument.onload = function () {
            var documentObj = JSON.parse(requestGetDocument.responseText);

            var data = "";
            // Extracted Data

            // Show the ID Authentication fields 

            data += AddDisplay("ID Authentication", getEnum(AssureIDResultEnum, documentObj.Result));

            if (documentObj.Result != AssureIDResultEnum.Passed && documentObj.Result != AssureIDResultEnum.Failed) {
                if (documentObj.Alerts.length > 0) {
                    var alerts = "";

                    for (var i = 0; i < documentObj.Alerts.length; i++) {

                        if (documentObj.Alerts[i] == documentObj.Result) {
                            alerts += documentObj.Alerts[i].Key + " ,";
                        }

                    }

                    //for (var alert of documentObj.Alerts)
                    //{
                    //    if (alert.Result == documentObj.Result) {
                    //        alerts += alert.Key + " ,";
                    //    }
                    //}

                    if (alerts != "") {
                        data += AddDisplay("Alert", alerts);
                    }
                }
            }

            // Show all the data fields and Face and signature image
            if (documentObj.Fields.length > 0) {
                // Extract all the data fields and signature and face images

                for (var i = 0; i < documentObj.Fields.length; i++) {

                    switch (documentObj.Fields[i].Name) {
                        case "Photo":
                            getFaceImage();
                            break;

                        case "Signature":
                            getSignatureImage();
                            break;

                        default:
                            // All the fields from the ID
                            data += AddDisplay(documentObj.Fields[i].Name, documentObj.Fields[i].Value);
                            break;

                    }


                    //            for (var field of documentObj.Fields)
                    //            {
                    //                switch (field.Name) {
                    //                    case "Photo":
                    //                        getFaceImage();
                    //                        break;

                    //                    case "Signature":
                    //                        getSignatureImage();
                    //        break;

                    //                    default:
                    //    // All the fields from the ID
                    //    data += AddDisplay(field.Name, field.Value);
                    //    break;
                    //}
                }
            };


            $(data).appendTo("#drivers-license-data");
            document.getElementById("extractedData").style.display = "inline";

            // If the Presentation or orientation of the images have changed. Please read the documentation to know more about orientation and presentation
            if ((cropImg == 1) || (documentObj.Classification.PresentationChanged == true) || (documentObj.Classification.OrientationChanged == true)) {
                // Pull the front and back images.
                getFrontImage();
                if (imgValBack != '') // If the back image was passsed
                {
                    getBackImage();
                }
            }

            // Hide the loading animation 
            $('#loading').html("");
            $("#div-controls").hide();
            $("#div-delete").show();
        };
    }

    function getFrontImage() {
        var requestGetFrontImage = createCORSRequest("GET", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID + "/Image?side=0&light=0");
        requestGetFrontImage.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        //requestGetFrontImage.setRequestHeader("Accept", "application/octet-stream");
        requestGetFrontImage.responseType = 'arraybuffer';
        requestGetFrontImage.send();
        requestGetFrontImage.onload = function () {
            var arr = new Uint8Array(requestGetFrontImage.response);
            // Convert the int array to a binary string
            // We have to use apply() as we are converting an *array*
            // and String.fromCharCode() takes one or more single values, not
            // an array.
            //var raw = String.fromCharCode.apply(null, arr);

            // Converting in chunks so that it does not result in stack overflow error
            var raw = '';
            var i, j, subArray, chunk = 5000;
            for (i = 0, j = arr.length; i < j; i += chunk) {
                subArray = arr.subarray(i, i + chunk);
                raw += String.fromCharCode.apply(null, subArray);
            }

            var base64FrontReformattedImage = btoa(raw);

            document.getElementById("extractedData").style.display = "inline";
            $("#image-thumbnail-front img:first-child").attr("src", "data:image/jpg;base64," + base64FrontReformattedImage);
        };
    }

    function getBackImage() {
        var requestGetBackImage = createCORSRequest("GET", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID + "/Image?side=1&light=0");
        requestGetBackImage.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        //requestGetBackImage.setRequestHeader("Accept", "application/octet-stream");
        requestGetBackImage.responseType = 'arraybuffer';
        requestGetBackImage.send();
        requestGetBackImage.onload = function () {
            var arr = new Uint8Array(requestGetBackImage.response);
            // Convert the int array to a binary string
            // We have to use apply() as we are converting an *array*
            // and String.fromCharCode() takes one or more single values, not
            // an array.
            //var raw = String.fromCharCode.apply(null, arr);

            // Converting in chunks so that it does not result in stack overflow error
            var raw = '';
            var i, j, subArray, chunk = 5000;
            for (i = 0, j = arr.length; i < j; i += chunk) {
                subArray = arr.subarray(i, i + chunk);
                raw += String.fromCharCode.apply(null, subArray);
            }

            var base64BackReformattedImage = btoa(raw);

            document.getElementById("extractedData").style.display = "inline";
            $("#image-thumbnail-back img:first-child").attr("src", "data:image/jpg;base64," + base64BackReformattedImage);
        };
    }

    function getFaceImage() {
        var requestPhoto = createCORSRequest("GET", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID + "/Field/Image?key=Photo");
        requestPhoto.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        //requestPhoto.setRequestHeader("Accept", "application/octet-stream");
        requestPhoto.responseType = 'arraybuffer';
        requestPhoto.send();
        requestPhoto.onload = function () {
            var arr = new Uint8Array(requestPhoto.response);
            // Convert the int array to a binary string
            // We have to use apply() as we are converting an *array*
            // and String.fromCharCode() takes one or more single values, not
            // an array.
            var raw = String.fromCharCode.apply(null, arr);
            var base64FaceImage = btoa(raw);

            document.getElementById("faceImage").style.display = "inline";
            $("#face-image").attr("src", "data:image/jpg;base64," + base64FaceImage);
        };
    }

    function getSignatureImage() {
        var requestSign = createCORSRequest("GET", assureIDConnectEndpoint + "/AssureIDService/Document/" + instanceID + "/Field/Image?key=Signature");
        requestSign.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        requestSign.responseType = 'arraybuffer';
        requestSign.send();
        requestSign.onload = function () {
            var arr = new Uint8Array(requestSign.response);
            // Convert the int array to a binary string
            // We have to use apply() as we are converting an *array*
            // and String.fromCharCode() takes one or more single values, not
            // an array.
            var raw = String.fromCharCode.apply(null, arr);
            var base64SignImage = btoa(raw);

            document.getElementById("signImage").style.display = "inline";
            $("#signature-image").attr("src", "data:image/jpg;base64," + base64SignImage);
        };
    }
});