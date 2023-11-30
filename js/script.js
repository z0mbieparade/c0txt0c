
function set_font()
{
	let size = settings.settings.grid_font_size.value;
	let font_size_class = 'fontsize-' + size;
	let font = settings.settings.grid_font.value;
	let font_class = font.replace(/\s/g, '-') + '-font';

	var container_elem = document.getElementById('container');
	if(container_elem) container_elem.setAttribute('class', font_size_class + ' ' + font_class);
}

function set_cell()
{
	let x = settings.settings.selected_x.value;
	let y = settings.settings.selected_y.value;
	grid.select_cell(x, y, grid.cell_highlighted);
}

function set_bkg(val) 
{
	grid.set_background(val);
}

var settings = new Settings({
	grid_width: {
		label: 'Width',
		type: 'int',
		default: 40,
		min: 1,
		max: 5000
	},
	grid_height: {
		label: 'Height',
		type: 'int',
		default: 30,
		min: 1,
		max: 5000
	},
	grid_font: {
		label: 'Font',
		type: 'enum',
		values: font_select,
		default: 'IBM Plex Mono',
		on_change: set_font
	},
	grid_font_size: {
		label: 'Font Size',
		type: 'enum',
		values: font_size_select,
		default: 20,
		on_change: set_font
	},
	selected_x: {
		label: 'X',
		type: 'int',
		default: 0,
		min: 0,
		on_change: set_cell
	},
	selected_y: {
		label: 'Y',
		type: 'int',
		default: 0,
		min: 0,
		on_change: set_cell
	},
	background_color: {
		label: 'BKG Color',
		type: 'color',
		default: [0, 0, 0, 1],
		on_change: set_bkg
	}
  }, {
	app_name: 'c0txt0c',
	local_storage: true
});
var grid = new Grid(settings);

window.addEventListener('load', () =>
{
	settings.build_settings();
	grid.build_overlay();

	window.addEventListener('keydown', (e) => 
	{
		console.log(e);

		let xy = [0,0];
		let selected_cell = document.querySelector('.grid_cell.selected');
		
		if(e.key === 'ArrowDown')
		{
			if(!selected_cell){ 
				grid.select_cell(0, 0);
			} else {
				xy = [
					+selected_cell.getAttribute('x'),
					+selected_cell.getAttribute('y')
				];
				let next_cell = document.querySelector('.grid_cell[y="' + (xy[1] + 1) + '"][x="' + xy[0] + '"]');
				if(!next_cell) next_cell = document.querySelector('.grid_cell[y="0"][x="' + xy[0] + '"]');
				if(!next_cell) next_cell = document.querySelector('.grid_cell[y="0"][x="0"]');
				grid.select_cell(next_cell);
			}
		}
		else if(e.key === 'ArrowRight')
		{
			if(!selected_cell){ 
				grid.select_cell(0, 0);
			} else {
				xy = [
					+selected_cell.getAttribute('x'),
					+selected_cell.getAttribute('y')
				];
				let next_cell = document.querySelector('.grid_cell[y="' + xy[1] + '"][x="' + (xy[0] + 1) + '"]');
				if(!next_cell) next_cell = document.querySelector('.grid_cell[y="' + xy[1] + '"][x="0"]');
				if(!next_cell) next_cell = document.querySelector('.grid_cell[y="0"][x="0"]');
				grid.select_cell(next_cell);
			}
		}
		else if(e.key === 'ArrowUp')
		{
			if(!selected_cell){ 
				grid.select_cell(0, 0);
			} else {
				xy = [
					+selected_cell.getAttribute('x'),
					+selected_cell.getAttribute('y')
				];
				let next_cell = document.querySelector('.grid_cell[y="' + (xy[1] - 1) + '"][x="' + xy[0] + '"]');
				if(!next_cell) next_cell = document.querySelector('#grid .grid_row:last-child .grid_cell[x="' + xy[0] + '"]');
				if(!next_cell) next_cell = document.querySelector('#grid .grid_row:last-child .grid_cell[x="0"]');
				grid.select_cell(next_cell);
			}
		}
		else if(e.key === 'ArrowLeft')
		{
			if(!selected_cell){ 
				grid.select_cell(0, 0);
			} else {
				xy = [
					+selected_cell.getAttribute('x'),
					+selected_cell.getAttribute('y')
				];
				let next_cell = document.querySelector('.grid_cell[y="' + xy[1] + '"][x="' + (xy[0] - 1) + '"]');
				if(!next_cell) next_cell = document.querySelector('#grid .grid_row[y="' + xy[1] + '"] .grid_cell:last-child');
				if(!next_cell) next_cell = document.querySelector('#grid .grid_row[y="0"] .grid_cell:last-child');
				grid.select_cell(next_cell);
			}
		}
		else 
		{
			grid.set_char(e.key, {
				method: 'keydown'
			});
		}
	});
});