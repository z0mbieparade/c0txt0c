class Grid
{
	constructor(settings)
	{
        this.settings = settings;
        this.grid_elem = document.getElementById('grid');
        this.overlay_elem = document.querySelector('#grid #overlay');
        this.cell_highlighted = false;

        this.layers = new Layers(this, settings);
    }

    build_overlay()
    {
        const height = this.settings.settings.grid_height.value;
        const width = this.settings.settings.grid_width.value;

        //build grid rows
        for(let h = 0; h < height; h++)
        {
            let row = document.createElement('div');
            row.classList.add('grid_row');
            row.setAttribute('y', h);

            //add grid cells
            for(let w = 0; w < width; w++)
            {
                let cell = document.createElement('div');
                cell.classList.add('grid_cell');

                if(h === 0 && w % 5 === 0)
                {
                    cell.classList.add('grid_num_horz');
                }

                if(w === 0 && h % 5 === 0)
                {
                    cell.classList.add('grid_num_vert');
                }

                cell.setAttribute('id', 'cell-' + h + '-' + w);
                cell.setAttribute('y', h);
                cell.setAttribute('x', w);
                cell.setAttribute('hov', 'x,y: ' + w + ',' + h);
                cell.innerText = ' ';

                cell.addEventListener('click', (e) => 
                {
                    this.cell_highlighted = false;
                    this.settings.settings.selected_y.set_value(h, false);
                    this.settings.settings.selected_x.set_value(w, true);
                });

                cell.addEventListener('dblclick', (e) => 
                {
                    this.cell_highlighted = true;
                    this.settings.settings.selected_y.set_value(h, false);
                    this.settings.settings.selected_x.set_value(w, true);

                    console.log('dblclick');
                });

                row.appendChild(cell);
            }

            this.overlay_elem.appendChild(row);
        }

        const selected_row = this.settings.settings.selected_y.value;
        const selected_col = this.settings.settings.selected_x.value;
        this.select_cell(selected_row, selected_col);

        this.layers.load();
    }

    //x, y || cell element
    //highlight === true/false. if true, it's a "double click" on a cell. we don't do text area stuff when typing. only edit that cell.
    select_cell()
    {
        let new_selected_row, new_selected_cell, x, y, highlight;

        if(!isNaN(arguments[0]) && !isNaN(arguments[1]))
        {
            x = arguments[0];
            y = arguments[1];
            highlight = arguments[2] === true ? true : false;

            new_selected_row = document.querySelector('#overlay .grid_row[y="' + y + '"]');
            new_selected_cell = document.querySelector('#overlay .grid_cell[y="' + y + '"][x="' + x + '"]');
        }
        else if(arguments[0] && typeof arguments[0] === 'object' && arguments[0].classList && arguments[0].classList.contains('grid_cell'))
        {
            new_selected_cell = arguments[0];
            highlight = arguments[1] === true ? true : false;
            y = new_selected_cell.getAttribute('y');
            x = new_selected_cell.getAttribute('x');
            new_selected_row = document.querySelector('#overlay .grid_row[y="' + y + '"]');
        }
        
        if(new_selected_row !== undefined && new_selected_row !== null && 
            new_selected_cell !== undefined && new_selected_cell !== null)
        {

            let selected = document.querySelectorAll('#overlay .selected');
            [...selected].forEach((elem) => elem.classList.remove('selected'));
            selected = document.querySelectorAll('#overlay .highlighted');
            [...selected].forEach((elem) => elem.classList.remove('highlighted'));
            
            new_selected_row.classList.add('selected');
            new_selected_cell.classList.add('selected');

            if(highlight === true)
            {
                new_selected_row.classList.add('highlighted');
                new_selected_cell.classList.add('highlighted');
            }
        }
    }

    set_char(char, options)
    {
        options = {
            method: 'keydown', //keydown moves to next cell after, manual doesn't.
            xy: 'selected', //[0,0] to select specific cell
            ...options
        };

        let selected_layer = this.layers.selected;
        if(!selected_layer) return;

        let cell = false;
        let x = 0;
        let y = 0;
        if(options.xy === 'selected')
        {
            cell = document.querySelector('#overlay .grid_cell.selected');
            x = +cell.getAttribute('x');
            y = +cell.getAttribute('y');
        }
        else if(options.xy && Array.isArray(options.xy) && options.xy.length === 2)
        {
            x = options.xy[0];
            y = options.xy[1];
            cell = document.querySelector('#overlay .grid_cell[x="' + x + '"][y="' + y + '"]');
        }

        if(!cell) return;

        if(char === null || char === undefined || char === false) char = ' ';

        if(char === 'Backspace' || char === 'Delete')
        {
            selected_layer.edit('update', x, y, { char: null })
        }
        else if(char.length === 1)
        {
            selected_layer.edit('update', x, y, { char: char })
        }

        if(options.method === 'keydown' && this.cell_highlighted === false)
        {
            let next_cell = false;
            if(char === 'Backspace')  //move to prev cell
            {
                next_cell = document.querySelector('.grid_cell[x="' + (x - 1) + '"][y="' + y + '"]');
                if(!next_cell) next_cell = document.querySelector('.grid_row[y="' + (y - 1) + '"] .grid_cell:last-child');
                if(!next_cell) next_cell = document.querySelector('.grid_cell[x="0"][y="0"]');

                //backspace move line
                this.edit_layer('subtract', +next_cell.getAttribute('x'), +next_cell.getAttribute('y'));
            }
            else if(char === 'Delete') 
            {
                //delete move line
                this.edit_layer('subtract', x, y);
            }
            else if(char.length === 1)  //move to next cell
            {
                next_cell = document.querySelector('.grid_cell[x="' + (x + 1) + '"][y="' + y + '"]');
                if(!next_cell) next_cell = document.querySelector('.grid_cell[x="0"][y="' + (y + 1) + '"]');
                if(!next_cell) next_cell = document.querySelector('.grid_cell[x="0"][y="0"]');
            }
            
            if(next_cell) this.select_cell(next_cell);
        }

        selected_layer.save();
    }

    set background(rgba)
    {
        this.grid_elem.setAttribute('style', 'background-color:rgba(' + rgba.join(',') + ');');
    }

    
}