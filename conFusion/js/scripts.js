$(document).ready(function(){
    $('#mycarousel').carousel({ interval: 2000 });
    $('#carouselButton').click(function() {
        if($('#carouselButton').children('span').hasClass('fa-pause')) {
            $('#mycarousel').carousel('pause');
            $(this).children('span').removeClass('fa-pause');
            $(this).children('span').addClass('fa-play');
        } else if($('#carouselButton').children('span').hasClass('fa-play')){
            $('#mycarousel').carousel('cycle');
            $(this).children('span').removeClass('fa-play');
            $(this).children('span').addClass('fa-pause');
        };
    });

    //Modal Scripts:
    //Used 'Show' instead of toggle bc buttons cannot not be pushed if modals are showing
    $('#loginButton').click(function() {
        $('#loginModal').modal('show');
    });
    $('#reserveButton').click(function() {
        $('#reserveModal').modal('show');
    });
});