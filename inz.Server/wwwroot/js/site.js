$(function () {
    const placeholderElement = $('#modal-placeholder');
    let modal = null;

    $('body').on('click', '[data-bs-toggle="ajax-modal"]', function (event) {
        event.preventDefault();
        const url = $(this).attr('href') || $(this).data('url');

        $.get(url).done(function (data) {
            placeholderElement.html(data);
            const modalElement = placeholderElement.find('.modal')[0];
            modal = new bootstrap.Modal(modalElement);
            modalElement.addEventListener('hidden.bs.modal', function () {
                placeholderElement.empty();
                modal = null;
            });
            modal.show();
        });
    });

    placeholderElement.on('submit', 'form', function (event) {
        if (modal) modal.hide();
    });
});