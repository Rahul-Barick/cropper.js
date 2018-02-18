$(function () {
    $("form").submit(function (event) {
        if (!event.target.checkValidity()) {
            event.preventDefault(); // dismiss the default functionality
            alert('Please, fill the form'); // error message
            return false;
        }
        return true;
    });
});