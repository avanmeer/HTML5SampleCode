$(document).ready(function () {

    $('input[type="checkbox"]').not('#create-switch').bootstrapSwitch();
    $("#rdoFront").prop("checked", true)
    $("#rdoFront").parent().addClass("active");

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
        //        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        //        if (navigator.getUserMedia) {
        //            navigator.getUserMedia
        //                            (
        //                              { video: true },
        //                              function (localMediaStream) {
        //                                  video.src = window.URL.createObjectURL(localMediaStream);
        //                              }, onFailure);
        //        }

        $("#help-icon").tooltip({ placement: 'bottom' });
        $('#chkPreProcessing').bootstrapSwitch('setState', false);
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

    //Clears populated controls. Prepares UI for next processing.
    function ResetControls() {
        document.getElementById("extractedData").style.display = "none";
        $('#medicalcard-data').empty();
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
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-front").click(function () {
        $("#input-image-front").click();
        $('#extractedData').hide();
        $('#medicalcard-data').empty();
        $('#loading').empty();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-back").click(function () {
        $("#input-image-back").click();
        $('#extractedData').hide();
        $('#medicalcard-data').empty();
        $('#loading').empty();
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-front").click(function () {
        $("#input-image-front").click();
        $('#extractedData').hide();
        $('#medicalcard-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-front").fileupload("clear");
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-back").click(function () {
        $("#input-image-back").click();
        $('#extractedData').hide();
        $('#medicalcard-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-back").fileupload("clear");
    });

    var preprocessedFrontImage;
    var unmodifiedFrontImage;
    //Resize image
    $('#input-image-front').change(function (e) {
        var file = e.target.files[0];

        var maxWidth = 2048;
        var maxHeight = 1536;

        canvasResize(file, {
            crop: false,
            quality: 75,
            isiOS: isMobile.iOS(),
            isPreprocessing: true,
            cardType: "MedicalCard",
            callback: function (data, width, height) {
                preprocessedFrontImage = utilities.DataUrlToBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "MedicalCard",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                unmodifiedFrontImage = utilities.DataUrlToBlob(data);
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
            isiOS: isMobile.iOS(),
            isPreprocessing: true,
            cardType: "MedicalCard",
            callback: function (data, width, height) {
                preprocessedBackImage = utilities.DataUrlToBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "MedicalCard",
            callback: function (data, width, height) {
                unmodifiedBackImage = utilities.DataUrlToBlob(data);
            }
        });
    });

    $("#btn-process-image").click(function () {

        ResetControls();
        var isSourceCameraOrDisk = $('#chkImageSource').is(':checked') ? true : false;
        var usePreprocessing = $('#chkPreProcessing').is(':checked') ? true : false;
        var imageSource = $("#imageSource-select").val();

        var imageToProcess;
        var imgValFront = $('#input-image-front').val();
        var imgValBack = $('#input-image-back').val();

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

            imageToProcess = new FormData();

            if (usePreprocessing) {
                imageToProcess.append("frontImage", preprocessedFrontImage);

                if (imgValBack != '')
                    imageToProcess.append("backImage", preprocessedBackImage);
            }
            else {
                imageToProcess.append("frontImage", unmodifiedFrontImage);

                if (imgValBack != '')
                    imageToProcess.append("backImage", unmodifiedBackImage);
            }
        }
        else {
            imageToProcess = new FormData();
            dataUrl = selectedCanvasFront.toDataURL();
            image = dataURLtoBlob(dataUrl);
            var blankDataUrl = blankCanvasFront.toDataURL();

            if (dataUrl == blankDataUrl) {
                alert("Capture image first before processing.");
                return;
            }
            //imageToProcess = image;
            imageToProcess.append("files", image);


            dataUrl = selectedCanvasBack.toDataURL();

            if (dataUrl != blankDataUrl) {
                image = dataURLtoBlob(dataUrl);
                imageToProcess.append("files", image);
            }
        }

        var promise = acuantWebservice.ProcessMedInsuranceCard(imageToProcess, imageSource, usePreprocessing);

        promise.error(function (response) {

            var error = jQuery.parseJSON(JSON.stringify(response));
            $('#errorDiv').html("Error: " + JSON.stringify(error.status + " " + error.statusText));
        });

        promise.done(function (response) {

            var medicalCard = JSON.stringify(response);
            medicalCard = jQuery.parseJSON(medicalCard);

            if (medicalCard.ResponseCodeAuthorization < 0) {
                ui.ShowErrorDescription(medicalCard.ResponseMessageAuthorization);
            }
            else if (medicalCard.ResponseCodeProcMedicalCard < 0) {
                ui.ShowErrorDescription(medicalCard.ResponseCodeProcMedicalCardDesc);
            }
            else if (medicalCard.WebResponseCode < 1) {
                ui.ShowErrorDescription(medicalCard.WebResponseDescription);
            }
            else {

                //Display data returned by the web service
                var data = ui.DisplayField("MemberName", medicalCard.MemberName);
                data += ui.DisplayField("NameSuffix", medicalCard.NameSuffix);
                data += ui.DisplayField("NamePrefix", medicalCard.NamePrefix);
                data += ui.DisplayField("FirstName", medicalCard.FirstName);
                data += ui.DisplayField("MiddleName", medicalCard.MiddleName);
                data += ui.DisplayField("LastName", medicalCard.LastName);
                data += ui.DisplayField("MemberId", medicalCard.MemberId);
                data += ui.DisplayField("GroupNumber", medicalCard.GroupNumber);
                data += ui.DisplayField("ContractCode", medicalCard.ContractCode);
                data += ui.DisplayField("CopayEr", medicalCard.CopayEr);
                data += ui.DisplayField("CopayOv", medicalCard.CopayOv);
                data += ui.DisplayField("CopaySp", medicalCard.CopaySp);
                data += ui.DisplayField("CopayUc", medicalCard.CopayUc);
                data += ui.DisplayField("Coverage", medicalCard.Coverage);
                data += ui.DisplayField("DateOfBirth", medicalCard.DateOfBirth);
                data += ui.DisplayField("Deductible", medicalCard.Deductible);
                data += ui.DisplayField("EffectiveDate", medicalCard.EffectiveDate);
                data += ui.DisplayField("Employer", medicalCard.Employer);
                data += ui.DisplayField("ExpirationDate", medicalCard.ExpirationDate);
                data += ui.DisplayField("GroupName", medicalCard.GroupName);
                data += ui.DisplayField("IssuerNumber", medicalCard.IssuerNumber);
                data += ui.DisplayField("Other", medicalCard.Other);
                data += ui.DisplayField("PayerId", medicalCard.PayerId);
                data += ui.DisplayField("PlanAdmin", medicalCard.PlanAdmin);
                data += ui.DisplayField("PlanProvider", medicalCard.PlanProvider);
                data += ui.DisplayField("PlanType", medicalCard.PlanType);
                data += ui.DisplayField("RxBin", medicalCard.RxBin);
                data += ui.DisplayField("RxGroup", medicalCard.RxGroup);
                data += ui.DisplayField("RxId", medicalCard.RxId);
                data += ui.DisplayField("RxPcn", medicalCard.RxPcn);


                if (medicalCard.ListAddress != null) {
                    var addressCount = medicalCard.ListAddress.length;
                    if (addressCount > 0) {
                        for (var i = 0; i < addressCount; i++) {
                            data += ui.DisplayField("Full Address (" + (i + 1) + ") ", medicalCard.ListAddress[i].FullAddress);
                            data += ui.DisplayField("Street (" + (i + 1) + ")", medicalCard.ListAddress[i].Street);
                            data += ui.DisplayField("City (" + (i + 1) + ")", medicalCard.ListAddress[i].City);
                            data += ui.DisplayField("State (" + (i + 1) + ")", medicalCard.ListAddress[i].State);
                            data += ui.DisplayField("Zip (" + (i + 1) + ")", medicalCard.ListAddress[i].Zip);
                        }
                    }
                }

                if (medicalCard.ListWeb != null) {
                    var webCount = medicalCard.ListWeb.length;
                    if (webCount > 0) {
                        for (var i = 0; i < webCount; i++) {
                            data += ui.DisplayField("Web (" + (i + 1) + ")", medicalCard.ListWeb[i].Label == "" ? medicalCard.ListWeb[i].Value : medicalCard.ListWeb[i].Label + " - " + medicalCard.ListWeb[i].Value);
                        }
                    }
                }

                if (medicalCard.ListEmail != null) {
                    var emailCount = medicalCard.ListEmail.length;
                    if (emailCount > 0) {
                        for (var i = 0; i < emailCount; i++) {
                            data += ui.DisplayField("Email (" + (i + 1) + ")", medicalCard.ListEmail[i].Label == "" ? medicalCard.ListEmail[i].Value : medicalCard.ListEmail[i].Label + " - " + medicalCard.ListEmail[i].Value);
                        }
                    }
                }

                if (medicalCard.ListTelephone != null) {
                    var telephoneCount = medicalCard.ListTelephone.length;
                    if (telephoneCount > 0) {
                        for (var i = 0; i < telephoneCount; i++) {
                            data += ui.DisplayField("Telephone (" + (i + 1) + ")", medicalCard.ListTelephone[i].Label == "" ? medicalCard.ListTelephone[i].Value : medicalCard.ListTelephone[i].Label + " - " + medicalCard.ListTelephone[i].Value);
                        }
                    }
                }

                if (medicalCard.ListDeductible != null) {
                    var deductibleCount = medicalCard.ListDeductible.length;
                    if (deductibleCount > 0) {
                        for (var i = 0; i < deductibleCount; i++) {
                            data += ui.DisplayField("Deductible (" + (i + 1) + ")", medicalCard.ListDeductible[i].Label == "" ? medicalCard.ListDeductible[i].Value : medicalCard.ListDeductible[i].Label + " - " + medicalCard.ListDeductible[i].Value);
                        }
                    }
                }

                if (medicalCard.ListPlanCode != null) {
                    var planCodeCount = medicalCard.ListPlanCode.length;
                    if (planCodeCount > 0) {
                        for (var i = 0; i < planCodeCount; i++) {
                            data += ui.DisplayField("PlanCode (" + (i + 1) + ")", medicalCard.ListPlanCode[i].PlanCode);
                        }
                    }
                }

                $(data).appendTo("#medicalcard-data");
                $("#extractedData").show();
            }

            //Display reformatted images on UI
            var reformattedImageFront = medicalCard.ReformattedImage;
            if (reformattedImageFront != null) {
                var base64ReformattedImage = goog.crypt.base64.encodeByteArray(reformattedImageFront);
                $("#image-thumbnail-front img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
            }

            var reformattedImageBack = medicalCard.ReformattedImageTwo;
            if (reformattedImageBack != null) {
                var base64ReformattedImage = goog.crypt.base64.encodeByteArray(reformattedImageBack);
                $("#image-thumbnail-back img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
            }

        });

        promise.always(function () {
            ui.RemoveLoadingIcon();
            $("#div-controls").hide();
        });
    });

});