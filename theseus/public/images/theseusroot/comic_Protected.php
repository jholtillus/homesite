<!DOCTYPE HTML>
<!--
	Story by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->

<?php
	//specify directory here
	$dir = "./images/comics";
	$link = "comic.php";
	$a = scandir($dir);
	//get last file
	$latest=ltrim(substr(end($a),8,strlen(end($a))-12),"0");
	//print_r($latest);
	$first=1;
	//$latest=10;
	$current=$_GET['comic'];
	if($current=='latest') {$current=$latest;}
	if($current == "") {$current=$latest;}
	$next=$current+1;
	$previous=$current-1;
	$myFile = $dir."/notes/notes.txt";
	$notes = file($myFile);//file in to an array
?>

<html>
	<head>
		<?php echo '<title>Theseus: the Comic Page '.$current.'</title>'; ?>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="/assets/css/main.css" />
		<link rel="shortcut icon" href="favicon.png" type="image/x-icon">
		<noscript><link rel="stylesheet" href="/assets/css/noscript.css" /></noscript>
		<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-21784059-8"></script>
<script>
    window.onload = function pageRedirect() {
        <?php echo 'window.location.replace("'.$link.'?comic='.$current.'")' ?>;
    }      
</script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-21784059-8');
</script>

		<script>
		document.addEventListener("keyup",function(e){
   var key = e.which||e.keyCode;
   switch(key){
      //left arrow
      case 37:
         document.getElementById("prevLink").click();
      break;
      //right arrow
      case 39:
         document.getElementById("nextLink").click();
      break;
   }
});</script>
	</head>
	<body class="is-preload">
				
			

		<!-- Wrapper -->
				<!-- One -->
					
				<!-- Two -->
				

				<!-- logo -->
					<section class="wrapper style1 align-center">
						<div class="logo" style="background-image: url('images/headerbg.png')">
							<a href="/"><img src="images/theseus_logo_03.png" class="toplogo"></a>
							<p><h1><?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$first.'><img src="/images/buttons/first.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/first_alt.png" class="arrowbutton">'; }?>
								<?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$previous.' id="prevLink"><img src="/images/buttons/previous.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/previous_alt.png" class="arrowbutton">'; }?>
								<strong><text class="arrowbutton"><?php echo $current; ?></text></strong>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$next.'><img src="/images/buttons/next.png" class="arrowbutton" id="nextLink"></a>'; } else {echo '<img src="/images/buttons/next_alt.png" class="arrowbutton">'; }?>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$latest.'><img src="/images/buttons/latest.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/latest_alt.png" class="arrowbutton">'; }?></h1></p>
						</div>
					</section>

				<!-- comic -->
					<section class="wrapper style1 align-center">
						<div class="comic2" style="background-image: url('images/pagebg.png')">
							<?php echo '<img class="comicpageresponsive" src="/images/comics/theseus_'.sprintf("%03d",$current).'.jpg">'; ?>
						</div>
					</section>

				<!-- buttons -->
					<section class="wrapper style1 align-center">
						<div class="lowerbuttons"  style="background-image: url('images/headerbg.png')">
							<p><h1><?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$first.'><img src="/images/buttons/first.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/first_alt.png" class="arrowbutton">'; }?>
								<?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$previous.'><img src="/images/buttons/previous.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/previous_alt.png" class="arrowbutton">'; }?>
								<strong><text class="arrowbutton"><?php echo $current; ?></text></strong>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$next.'><img src="/images/buttons/next.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/next_alt.png" class="arrowbutton">'; }?>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$latest.'><img src="/images/buttons/latest.png" class="arrowbutton"></a>'; } else {echo '<img src="/images/buttons/latest_alt.png" class="arrowbutton">'; }?></h1></p>						
						</div>
					</section>
	
	


				<!-- Six -->
	<section class="wrapper style3">
					<div class="inner">
						<div class="row">
  
  <div class="bigcolumn">
    <h4>Notes</h4>
    <p><?php echo $notes[$current-1]; ?></p>
	  <div id="disqus_thread"></div>
<div id="disqus_thread"></div>
<script>

/**
*  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
*  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
/*
var disqus_config = function () {
this.page.url = 'http://www.theseuscomic.com/comic.php';  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = 'http://www.theseuscomic.com/comic.php?='.sprintf("%03d",$current).''; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};
*/
(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = 'https://theseus-comic.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
	  <?php echo '<img class="responsive" src="/images/comics/noteimages/wip_'.sprintf("%03d",$current).'.jpg">'; ?>
							
  </div>
  <div class="column">
   <a href="http://www.reddit.com/r/theseuscomic"><img src="images/buttons/reddit_follow.jpg" class="responsive"></a><a href="http://www.instagram.com/jholtillus"><img src="images/buttons/instagram_follow.jpg" class="responsive"></a><a href="http://twitter.com/jholtillus"><img src="images/buttons/twitter_follow.jpg" class="responsive"></a>
  </div>
							<div class="column"><a href="/archive.html"><img src="images/buttons/archivebutton.jpg" class="responsive"></a>
    <a href="https://www.topwebcomics.com/vote/26274"><img src="images/buttons/topweb.jpg" class="responsive"></a>
    <p style="font-size=10pt">Top Web Comics advertises thousands of comics, many of which have banners that you can never unsee. Visit at your own risk.</p>
  </div>
</div>
		</div>
		<div><p><center><strong>Jordan Holt &copy; 2020</strong></center></p></div>
	</section>
					
				<!-- Seven -->
					<!-- Footer -->

				
		<!-- Scripts -->
			<script src="assets/js/jquery.min.js"></script>
			<script src="assets/js/jquery.scrollex.min.js"></script>
			<script src="assets/js/jquery.scrolly.min.js"></script>
			<script src="assets/js/browser.min.js"></script>
			<script src="assets/js/breakpoints.min.js"></script>
			<script src="assets/js/util.js"></script>
			<script src="assets/js/main.js"></script>

	</body>
</html>