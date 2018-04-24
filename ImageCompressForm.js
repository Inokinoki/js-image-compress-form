/**
 * Transform dataUrl to Blob
 * @param {String} dataURL 
 */
function dataURLtoBlob(dataURL) {
    var binary = atob(dataURL.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

/**
 * Compress image to limited size
 * @param {Image} image 
 * @param {Integer} sizeLimit 
 */
function compress(image, sizeLimit) {
    var width = image.width,
        height = image.height,
        multiple = 1.0;
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    do {
        var thumbW = Math.floor(width/multiple), thumbH = Math.floor(height/multiple);
        canvas.width = thumbW;
        canvas.height = thumbH;
        context.drawImage(image, 0, 0, thumbW, thumbH);
        var dataUrl = canvas.toDataURL("image/jpeg");

        blob = dataURLtoBlob(dataUrl);
        multiple+=0.2;
    } while (blob.size > sizeLimit);

    return blob;
}

/**
 * Bind with a form, in which we want to compress images
 * @class
 */
var ImageCompressForm = function(formElement, debug) {
    // Name list of registed compressed image file input
    this.needCompressedImageFile = [];
    // File dict for compressed images, index: file input name
    this.compressedImageFile = [];

    // Debug flag
    this.debug = debug;

    if (formElement)
        this.setFormData(formElement);

    // Default size set 300k
    this.limitSize = 300*1024;
};

ImageCompressForm.prototype = {
    /**
     * @property {String} requestMethod 
     * @property {String} requestUrl
     * @property {HTMLElement} formElement
     * @property {FormData} formData
     * @property {Integer} limitSize
     * @property {Array} needCompressedImageFile
     * @property {Array} compressedImageFile
     * @property {Boolean} debug
     */

    setRequestMethod : function(method) {
        this.requestMethod = method;
    },

    setRequestUrl : function(url) {
        this.requestUrl = url;
    },

    setFormData : function(formElement) {
        if (formElement && formElement.nodeName.toLowerCase() == "form") {
            this.formElement = formElement;
            // Create a new formData with current formElement
            this.formData = new FormData();
            // Request method, if not set, post
            this.requestMethod = formElement.hasAttribute("method") ?
                formElement.getAttribute("method") : "post";
            // Request url, if not set, current page
            this.requestUrl = formElement.hasAttribute("action") ?
                formElement.getAttribute("action") : "./";

            // Override onSubmit event
            formElement.onsubmit = function() {
                this.submit();
                return false;
            }.bind(this);
        }
    },

    getFormData : function() {
        return this.formData;
    },

    add : function(key, value, filename) {
        if (filename) {
            this.formData.append(key, value, filename);
        } else {
            this.formData.append(key, value);
        }
    },

    remove : function(key) {
        if (this.formData.has(key)) {
            this.formData.delete(key);
        }
    },

    registerCompressImage : function(fileDom) {
        // Dom is empty
        if (!fileDom)
            return 1;
        // Dom is input
        if (fileDom.nodeName.toLowerCase() != "input")
            return 2;
        // Dom is file input
        if (fileDom.type.toLowerCase() != "file")
            return 4;
        // Name need to be set
        if (!fileDom.name)
            return 8;

        if (this.needCompressedImageFile.indexOf(fileDom.name) < 0) {
            this.needCompressedImageFile.push(fileDom.name);
            // Register onchange for this dom
            fileDom.onchange = function() {
                for (var i=0; i<fileDom.files.length; i++) {
                    // Clean of create
                    this.compressedImageFile[fileDom.name] = []

                    var file = fileDom.files[i];
                    if (file) {
                        var reader = new FileReader();
                        // Pass the file, fileDom, form, index into reader
                        reader.form = this;
                        reader.file = file;
                        reader.fileDom = fileDom;
                        reader.index = i;

                        reader.onload = function(e) {
                            var url = e.target.result;
                            var image = new Image();
                            if (/\.(jpe?g|png)$/i.test(this.file.name)) {
                                // Pass the file, fileDom, form, index into image
                                image.form = this.form;
                                image.file = this.file;
                                image.fileDom = this.fileDom;
                                image.index = this.index;

                                image.onload = function() {
                                    if (this.file.size > this.form.limitSize) {
                                        // Need to be compressed
                                        console.log(this.file.name + " will be compressed.");
                                        blob = compress(this, this.form.limitSize);
                                        this.form.compressedImageFile[this.fileDom.name].push(blob);
                                        console.log(this.file.name + " be compressed form "+ this.file.size +" to "+ blob.size +".");
                                    } else {
                                        console.log(this.file.name + " will not be compressed.");
                                        blob = dataURLtoBlob(url);
                                        this.form.compressedImageFile[this.fileDom.name].push(blob);
                                    }
                                }
                                image.src = url;
                            } else {
                                console.log(this.file.name + " is not an image");
                                // Handle not image file
                                this.form.compressedImageFile[this.fileDom.name].push(this.file);
                            }
                        }
                        reader.readAsDataURL(file);
                    }
                }
            }.bind(this);
            return 0;
        }
        return 16;
    },

    setLimitSize : function(limitSize) {
        // Default 300k
        this.limitSize = limitSize > 0 ? limitSize : 300*1024;
    },

    submit : function() {
        // preSubmit
        if (this.preSubmit) {
            this.preSubmit(this);
        }
        
        // User customed submit method ?
        if (this.onSubmit) {
            // Execute user's method
            this.onSubmit(this);
        } else {
            if (this.formData) {
                if (this.formElement) {
                    this.formData = new FormData();
                    // Show tip
                    var submit_button = $("input[type=submit]")[0]
                    if (submit_button) submit_button.after("Uploading...");
                    // Copy all non-file input value
                    var inputs = this.formElement.getElementsByTagName("input"); // HTMLCollection
                    for(var i=0;i<inputs.length;i++) {
                        if (inputs[i].type) {
                            // Attach value according to the type
                            switch(inputs[i].type.toLowerCase()) {
                                case "radio":
                                    // Radio input
                                    if (inputs[i].checked) {
                                        this.add(inputs[i].name, inputs[i].value);
                                    }
                                    break;
                                case "text": case "password": case "hidden": case "number":
                                    if (inputs[i].value) {
                                        this.add(inputs[i].name, inputs[i].value);
                                    }
                                    break;
                                case "file":
                                    if (this.needCompressedImageFile.indexOf(inputs[i].name) >= 0) {
                                        // For raw file, add it and regard the name
                                        if (form.compressedImageFile[inputs[i].name][f] instanceof File) {
                                            form.add(inputs[i].name, form.compressedImageFile[inputs[i].name][f],
                                                f + "." + form.compressedImageFile[inputs[i].name][f].name);
                                            continue;
                                        }
                                        if (inputs[i].name && inputs[i].name in this.compressedImageFile) {
                                            for (var f=0; f<this.compressedImageFile[inputs[i].name].length; f++) {
                                                this.add(inputs[i].name, this.compressedImageFile[inputs[i].name][f],
                                                    inputs[i].name + "." + f + ".jpg");
                                            }
                                        }
                                    } else {
                                        if (inputs[i].files[0]) {
                                            this.add(inputs[i].name, inputs[i].files[0]);
                                        }
                                    }
                                    break;
                                case "checkbox":
                                    console.debug("[CHECKBOX]" + inputs[i].name + " " + inputs[i].value + " " + inputs[i].checked);
                                    // Have to do something
                                    break;
                                default:
                                    console.debug("[" + inputs[i].type + "] " + inputs[i].name + " " + inputs[i].value);
                                    break;
                            }
                        }
                    }
                    $.ajax({
                        url: this.requestUrl,
                        type: this.requestMethod,
                        data: this.formData,
                        processData: false,
                        contentType: false,
                        success: this.onSuccess,
                        error: this.onError
                    });
                }
            } else {
                console.debug("Cannot commit because of empty form data");
            }
        }

        // postSubmit
        if (this.postSubmit) {
            this.postSubmit(this);
        }
    },
};