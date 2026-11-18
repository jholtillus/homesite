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
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="/assets/css/main.css" />
		<noscript><link rel="stylesheet" href="/assets/css/noscript.css" /></noscript>
	</head>
	<body class="is-preload">



		<!-- Wrapper -->
			<div id="wrapper" class="divided">

				<!-- One -->

				<!-- Two -->


				<!-- logo -->
					<section class="wrapper style1 align-center">
						<div class="logo" style="background-image: url('/images/headerbg.png')">
							<a href="/index.html"><img src="/images/theseus_logo_03.png" class="toplogo"></a>
							<p><h1>
								<?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$first.'><img src="/images/buttons/first.png" class="arrowbutton"></a>'; }?>
								<?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$previous.'><img src="/images/buttons/previous.png" class="arrowbutton"></a>'; }?>
								<strong><text class="arrowbutton"><?php echo $current; ?></text></strong>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$next.'><img src="/images/buttons/next.png" class="arrowbutton"></a>'; }?>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$latest.'><img src="/images/buttons/latest.png" class="arrowbutton"></a>'; }?>
							</h1></p>
						</div>
					</section>

				<!-- comic -->
					<section class="wrapper style1 align-center">
						<div class="comic" style="background-image: url('/images/pagebg.png')">
							<?php echo '<img class="responsive" src="/images/comics/theseus_'.sprintf("%03d",$current).'.jpg">'; ?>
						</div>
					</section>

				<!-- buttons -->
					<section class="wrapper style1 align-center">
						<div class="lowerbuttons"  style="background-image: url('/images/headerbg.png')">
							<p><h1>
								<?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$first.'><img src="/images/buttons/first.png" class="arrowbutton"></a>'; }?>
								<?php IF ($current > $first) {echo '<a href='.$link.'?comic='.$previous.'><img src="/images/buttons/previous.png" class="arrowbutton"></a>'; }?>
								<strong><text class="arrowbutton"><?php echo $current; ?></text></strong>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$next.'><img src="/images/buttons/next.png" class="arrowbutton"></a>'; }?>
								<?php IF ($current < $latest) {echo '<a href='.$link.'?comic='.$latest.'><img src="/images/buttons/latest.png" class="arrowbutton"></a>'; }?>
							</h1></p>
						</div>
					</section>

				<!-- Six -->
						<section class="banner style1 orient-left content-align-left image-position-right fullscreen onload-image-fade-in onload-content-fade-right">
						<div class="content">
							<h3>Notes</h3>
							<p class="major"><?php echo $notes[$current-1]; ?></p>
						</div>
						<div class="image">
							<?php echo '<img class="responsive" src="/images/comics/noteimages/wip_'.sprintf("%03d",$current).'.jpg">'; ?>
						</div>
					</section>
				<!-- Seven -->


				<!-- Footer -->
					<footer class="wrapper style1 align-center">
						<div class="lowerbuttons">
							<ul class="icons">
								<li><a href="#" class="icon brands style2 fa-twitter"><span class="label">Twitter</span></a></li>
								<li><a href="#" class="icon brands style2 fa-instagram"><span class="label">Instagram</span></a></li>
							</ul>
							<p><strong>Jordan Holt &copy; 2020</strong></p>
						</div>
					</footer>

			</div>

		<!-- Scripts -->
			<script src="/assets/js/jquery.min.js"></script>
			<script src="/assets/js/jquery.scrollex.min.js"></script>
			<script src="/assets/js/jquery.scrolly.min.js"></script>
			<script src="/assets/js/browser.min.js"></script>
			<script src="/assets/js/breakpoints.min.js"></script>
			<script src="/assets/js/util.js"></script>
			<script src="/assets/js/main.js"></script>

	</body>
</html>
