$(function () {
    var canvas = $("#canvas");
    var context = canvas.get(0).getContext("2d");
    var result = $('#croppedresult');
    var imagetoCrop = $('#imagetocrop');
    var caption = $("input[name=caption]");
    var styling = $("select[name='styling']");
    var ocassion = $("select[name=ocassion]");
    imagetoCrop.on('change', showImage_crop);

    function showImage_crop() {
        var fr = new FileReader();
        fr.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                context.canvas.height = img.height;
                context.canvas.width = img.width;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
                canvas.cropper("destroy");
                canvas.cropper({
                    aspectRatio: 1 / 1
                });
            };
            img.src = e.target.result;
        };
        fr.readAsDataURL(this.files[0]);
    }
    $('#btnCrop').click(function () {
        // Get a string base 64 data url
        $('.photo_image').hide();
        var croppedImageDataURL = canvas.cropper('getCroppedCanvas').toDataURL("image/png");
        result.empty();
        result.append($('<img>').attr('src', croppedImageDataURL));
        $("#myModal").hide();
    });
    
    $('#btnRestore').click(function () {
        canvas.cropper('reset');
        result.empty();
    });


    $('a#photo_image_fancy_box').fancybox({
        type : "image"
    });


    // $('#croppedresult').fancybox({
        
    // });

    $("#addinspirations").on('click', function () {
        if (canvas.cropper('getCroppedCanvas')) {
            var croppedImageDataURL = canvas.cropper('getCroppedCanvas').toBlob(function (blob) {
                var formData = new FormData();
                formData.append('photo', blob);
                formData.append('caption', caption.val());
                if (ocassion.val() && ocassion.val().length) {
                    ocassion.val().forEach(function (ocassion_item) {
                        formData.append('ocassion', ocassion_item);
                    })
                }
                formData.append('styling', styling.val());
                $.ajax(locale_data.base_url + "inspirations/add", {
                    method: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function () {
                        window.location = locale_data.base_url + "inspirations/add?created=Inspiration Added successfully"
                    },
                    error: function () {
                        window.location = locale_data.base_url + "inspirations/add?error_message = Error"
                    }
                });
            });
        } else {
            alert("Uploading of Image is Compulsory")
            canvas.cropper("destroy");
        }
    });

    $("#submit").on('click', function () {

        if (canvas.cropper('getCroppedCanvas')) {
            var croppedImageDataURL = canvas.cropper('getCroppedCanvas').toBlob(function (blob) {
                editInspirationAjax(blob);
            });
            return;
        }
        editInspirationAjax(null);
    });

    function editInspirationAjax(blob) {
        var formData = new FormData();
        if (blob) {
            formData.append('photo', blob);
        }
        formData.append('caption', caption.val());
        formData.append('styling', styling.val());
        if (ocassion.val() && ocassion.val().length) {
            ocassion.val().forEach(function (ocassion_item) {
                formData.append('ocassion', ocassion_item);
            })
        }
        var objectId = window.location.href.lastIndexOf("/");
        var id = window.location.href.substring(objectId, window.location.href.length);
        $.ajax(window.location.href, {
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                window.location = locale_data.base_url + "inspirations/edit" + id + "?created=Inspiration Updated successfully"
                console.log(window.location.href)
            },
            error: function () {
                window.location = locale_data.base_url + "inspirations/edit" + id + "?error_message=Error"
            }
        });
    }
});