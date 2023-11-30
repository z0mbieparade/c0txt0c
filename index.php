<?php
require('settings_default.php');
$set = $settings;
$setup = false;
if(file_exists('settings.php')){
	include('settings.php');
	foreach($settings as $key => $val){
		$set[$key] = $val;
	}
	$setup = true;
}
if(file_exists('../all_settings.php')){
	include('../all_settings.php');
	if(isset($all_settings['c0txt0c'])){
		foreach($all_settings['c0txt0c'] as $key => $val){
			$set[$key] = $val;
		}
		$setup = true;
	}
}
$settings = $set;
?>
<!DOCTYPE html>
<html lang="en">
	<title><?php echo $settings['title']; ?></title>
	<meta property="og:title" content="<?php echo $settings['title']; ?>">
	<meta property="og:description" content="ASCII art creation and editing app.">
	<meta property="og:image" content="<?php echo $settings['c0txt0c_site_path']; ?>/css/images/card_img.png">
	<meta property="og:url" content="<?php echo $settings['c0txt0c_site_path']; ?>">
	<meta property="og:type" content="website">

	<meta name="twitter:title" content="<?php echo $settings['title']; ?>">
	<meta name="twitter:description" content="ASCII art creation and editing app.">
	<meta name="twitter:image" content="<?php echo $settings['c0txt0c_site_path']; ?>css/images/card_img.png">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:creator" content="@rotterz">

	<meta name="viewport" content="width=device-width,initial-scale=1">


	<?php
		$font_css = array_filter(scandir(getenv('APP_ROOT_PATH') . 'css/fonts/'), function($c){
			 return preg_match('/\.css$/', $c);
		 });

		 foreach ($font_css as $font)
		 {
		 	echo '<link rel="stylesheet" href="css/fonts/' . $font . '">' . PHP_EOL;
		 }
	?>

	<link rel="stylesheet" href="css/style.css">

	<style type="text/css">
	<?php
	$font_arr = array( //first bool true = google font
		'Andale Mono' => array(false, 'n4'),
		'Cogmind' => array(false, 'n4'),
		'Cogmind Smallcaps' => array(false, 'n4'),
		'Dark Courier' => array(false, 'n4','i4','n5','i5'),
		'Fixedsys Excelsior' => array(false, 'n4'),
		'IBM Plex Mono' => array(true, 'n4','i4','n5','i5'),
		'Menlo Regular' => array(false, 'n4'),
		'Roboto Mono' => array(true, 'n4','i4','n5','i5'),
		'Source Code Pro' => array(true, 'n4','i4','n5','i5'),
		'Unispace' => array(false, 'n4','i4','n5','i5'),
	);
	$font_select = array();
	$font_size_select = array();

	foreach($font_arr as $font => $styles)
	{
		$font_class = preg_replace('/\s/', '-', $font) . '-font';

		$font_select_txt = $font;

		$s = array();
		if(in_array('i4', $styles)) $s[] = 'i';
		if(in_array('n5', $styles)) $s[] = 'b';
		if(in_array('i5', $styles)) $s[] =  'bi';
		if(count($s) > 0) $font_select_txt .= ' (' . implode(',', $s) . ')';

		if($styles[0] === true) $font_select_txt .= ' (google font)';


		echo '#container.' . $font_class . ' #grid,' . PHP_EOL
				. '#container.' . $font_class . ' #grid .grid_row,' . PHP_EOL
				. '#container.' . $font_class . ' #grid .grid_cell' . PHP_EOL
				. '{' . PHP_EOL
				.   "font-family: '" . $font . "', monospace !important;" . PHP_EOL
				. '}' . PHP_EOL;

		
		$font_select[] = array('val' => $font, 'txt' => $font_select_txt);
	}

	$min_font_size = 8;
	$max_font_size = 25;
	$font_size_options = '';

	for($i = $min_font_size; $i <= $max_font_size; $i++)
	{
		$font_size_select[] = array('val' => $i, 'txt' => $i);

		$size_class = 'fontsize-' . $i;
		echo '#container.' . $size_class . ' #grid,' . PHP_EOL
			. '#container.' . $size_class . ' #grid .grid_row,' . PHP_EOL
			. '#container.' . $size_class . ' #grid .grid_cell' . PHP_EOL
				. '{' . PHP_EOL
				.   "font-size: " . $i . "px !important;" . PHP_EOL
				.   "line-height: " . $i . "px !important;" . PHP_EOL
				. '}' . PHP_EOL;

				// . 'html body.' . $size_class . ' #textarea_sizer,' . PHP_EOL
				// . 'html body.' . $size_class . ' #plain_textarea_sizer {' . PHP_EOL
				// .   "font-size: " . $i . ".5px !important;" . PHP_EOL
				// .   "line-height: " . $i . "px !important;" . PHP_EOL
				// . '}' . PHP_EOL;
	}

	?>
	</style>
	<body>

		<?php
		if(isset($_GET['clear']))
		{ ?>
		<script>
			let msg = 'Are you sure you want to reset the page? All your data will be deleted.';
			if (confirm(msg))
			{
				['c0txt0c_html_data', 'c0txt0c_irc_data', 'c0txt0c_bg_img', 'c0txt0c_text_data', 'c0txt0c_settings']
					.forEach((item) => localStorage.removeItem(item));
			}

			location.href = "<?php echo $settings['c0txt0c_site_path']; ?>";
		</script>
		<?php }
		else
		{ ?>

		<script>
		<?php if(!$setup){ ?>
			console.log('You have not created your settings.php file, please copy settings_default.php to settings.php and update it with correct settings.');
		<?php }?>
			setTimeout(function(){
				let load_int = 0;
				let load_arr = ['▛','▘','▚','▗','▟','▙','▖','▞','▝','▜'];
				window.setInterval(() => {
						document.getElementById('load_char').innerHTML = load_arr[load_int];
						load_int = load_int < load_arr.length - 1 ? load_int + 1 : 0;
				}, 250);
			},0)

			var font_arr = <?php echo json_encode($font_arr); ?>;
			var font_select = <?php echo json_encode($font_select); ?>;
			var font_size_select = <?php echo json_encode($font_size_select); ?>;
		</script>
		<div id="loader" class="loading initial" style="display:none;">
			<span id="force">If your browser is stuck, you can go to <?php echo $settings['c0txt0c_site_path']."?clear=true"; ?>
				to force your localStorage to clear out. Sometimes this can happen if you attempt to convert too large of an image. THIS WILL DELETE YOUR DATA!</span>
			<span id="load_char"></span>
		</div>

		<div id="container">
			<div id="settings">
				<div id="grid_width"></div>
				<div id="grid_height"></div>
				<div id="grid_font"></div>
				<div id="grid_font_size"></div>
			</div>
			<div id="hidden_settings">
				<div id="selected_x"></div>
				<div id="selected_y"></div>
			</div>

			<div id="grid">
				<div id="overlay"></div>
				<div id="layers"></div>
			</div>

			<div id="layers_panel" class="tool_panel">
				<span class="title">Layers</span>
				<ul id="layers_list">
				</ul>
				<div id="layer_actions">
					<div id="add_layer">+</div>
					<div id="delete_layer">-</div>
				</div>
			</div>
			<div id="chars_panel" class="tool_panel">
				<span class="title">Characters</span>
			</div>
			<div id="colors_panel" class="tool_panel">
				<span class="title">Colors</span>
			</div>

		</div>

		<script src="js/var_data.js"></script>
		<script src="js/settings.class.js"></script>
		<script src="js/layer.class.js"></script>
		<script src="js/layers.class.js"></script>
		<script src="js/grid.class.js"></script>
		<script src="js/script.js"></script>

		<?php  }

		if(isset($settings['include_footer']) && $settings['include_footer'] !== ''){
			include($settings['include_footer']);
		} ?>
	</body>
</html>
