# JSFormImageCompressor

Use HTML5 Canvas element to compress image to limit size. 

This is a pure js version, using ES5 grammars and prototype to realise the class.

The form can be only passed by Ajax.

Many things to be completed, welcome for your contribution.

### How to use

1. Import the jQuery and the single file ImageCompressForm.js

   ```Html
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
   <script src="ImageCompressForm.js"></script>
   ```

2. Get the form

   ```javascript
   var formDom = document.getElementById("example-form");
   ```

3. Create a ImageCompressForm object

   ```javascript
   var form = new ImageCompressForm(formDom);
   ```

4. Register the file input elements

   ```javascript
   form.registerCompressImage(document.getElementById("exampleInput4"));
   ```

5. Register the events

   ```Javascript
   form.onSuccess = onSuccess;	// onSucess is a function
   form.onError = onError;		// onError is another function
   ```

6. Enjoy the compression and **welcome to your contribution/modification**

### APIs

| Events     | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| onSubmit   | Data handle funtion alternate, called when button submit is pressed |
| preSubmit  | Hook before onSubmit                                         |
| postSubmit | Hook after onSubmit                                          |
| onSuccess  | Ajax callback when submit success (which means status code is 2xx/3xx) |
| onError    | Ajax callback when submit failed                             |

| Methods                               | Description                                                  |
| ------------------------------------- | ------------------------------------------------------------ |
| ImageCompressForm(formElement, debug) | Constructor                                                  |
| setRequestMethod(method)              | Set request method, usually it's POST                        |
| setRequestUrl(url)                    | Set request url                                              |
| setFormData(formElement)              | Set ImaeCompressForm with given form                         |
| getFormData()                         | Get FormData object inside                                   |
| add(key, value, filename)             | Add data into formData, for the text input or others, ignore the filename |
| remove(key)                           | Remove from formData, no supported in Safari                 |
| registerCompressImage(fileDom)        | Register form file input as a input that needs to be compressed |
| setLimitSize(limitSize)               | Set image limit size, if <= 0, set to 300kB                  |
| submit()                              | Function will be executed on form onsubmit event trigged     |

| Properties              | Type        | Description                                                  |
| ----------------------- | ----------- | ------------------------------------------------------------ |
| requestMethod           | String      | The method of request, POST, GET or others                   |
| requestUrl              | String      | The url on which ajax will arrive                            |
| formElement             | HTMLElement | The form element                                             |
| formData                | FormData    | Form data in which we store the request data, only be filled while onSubmit() runs |
| limitSize               | Integer     | Image limit size, by default 300kB (300x1024B)               |
| needCompressedImageFile | Array       | The array in which we stored the name of file input who needs to be compressed |
| compressedImageFile     | Array       | The array in which we stored the compressed image and raw file |
| debug                   | Boolean     | Display debug info                                           |

