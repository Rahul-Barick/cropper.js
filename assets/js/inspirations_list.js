$(function () {
    $(".chosen-select").chosen({});

    var dt_table = $('#list_table').DataTable({
        "processing": true,
        "serverSide": true,
        "paging": true,
        "dom": '<"top">lrt<"bottom"ip><"clear">',
        "ajax": {
            "contentType": "application/json",
            "url": locale_data.base_url + "inspirations/list",
            "type": "POST",
            "data": function (d) {
                console.log(JSON.stringify(d))
                return JSON.stringify(d);
            }},
        "columns": [
            {data: "caption",
                searchable: false,
                orderable: false
            },
            {"data": "photo_url",
                searchable: false,
                orderable: false,
                render:function(url,type,full){
                    return '<img height="80px" width="80px" alt="No Photo" src="'+full.photo_url+'"/>';
                }
            },
            {"data": "styling",
                searchable: false,
                orderable: false
            },
            {"data": "ocassion",
                searchable: false,
                orderable: false
        },
            {
                "data": null,
                searchable: false,
                orderable: false,
                "defaultContent": 
                '<a class="btn btn-default edit_details"> Edit'
                + '<a class="btn btn-default delete_details"> Delete'
            },     
        ],
        "rowCallback": function (row, data, index) {
            $(row).find('.edit_details').attr('href', locale_data.base_url + 'inspirations/edit/' + data._id);
            $(row).find('.delete_details').attr('id', data._id);
        },
});

    var inspiration_delete_ajax = function (inspiration, callback) {
    $.ajax({
        url: locale_data.base_url + "inspirations/delete",
        crossDomain: true,
        contentType: "application/json",
        headers: { "Content-Type": "application/json" },
        type: "DELETE",
        data: JSON.stringify({"inspiration_id":inspiration}),
        success: function (result) {
            $(dt_table.draw())
            callback(null, result);
        },
        error: function (request, status, error) {
            callback(request, null);
        }
    });
};

$("#list_table").on('click', '.delete_details', function () {
    var delete_confirm = confirm("Are you sure you want to delete a Inspiration");
    if (delete_confirm) {
        $('.my_loader').show();
        var inspiration_id = $(this).attr('id').replace("inspiration_", "");
        inspiration_delete_ajax(inspiration_id, function (err, result) {
            $('.my_loader').hide();
            if (err) {
                console.log(err);
                return;
            }
        });
    }
});

    $("#search_list").on('click', function () {
        var search = {};
        search.caption = $("#inspiration_caption").val() || null;
        search.styling = $(".chosen-select").val() || null;
        search.ocassion = $(".chosen-single").val() || null;
       dt_table.search(JSON.stringify(search)).draw();
    });

    $('#delete_details').on('click',function(){
        var remove = confirm("Are you sure want to Delete")
    })
});