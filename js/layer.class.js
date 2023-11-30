class Layer
{
    constructor(layers, key, options, data)
	{
        console.log(key, options, data);

        this.layers = layers;
        this.li_elem = false;
        this.layer_elem = false;

        let id = 0;
        let last_created_layer = layers.last_created;
        if(last_created_layer) id = last_created_layer.options.id + 1;

        let layer_order = 0;
        let selected_layer = layers.selected;
        if(selected_layer) layer_order = selected_layer.options.order + 1;

        console.log({last_created_layer, selected_layer});

        let use_key = key ? key : 'layer_' + id;

        let setting = layers.settings.settings[use_key] ? layers.settings.settings[use_key].value : {data: {}};

        this.data = {
            ...setting.data,
            ...data,
        };

        this.options = {
            ...{
                id: id,
                label: 'Layer ' + id,
                order: layer_order,
                visible: true,
                selected: true
            }, 
            ...setting,
            ...options
        };
        delete this.options.data;
        this.options.key = use_key;

        console.log({data: this.data, options: this.options});

        //is there a layer existing already with this key?
        if(!layers.settings.settings[use_key])
        {
            layers.settings.add(use_key, false, true, {
                type: 'layer',
                default: {
                    id: this.options.id,
                    label: 'Layer ' + id,
                    order: 0,
                    visible: true,
                    selected: false,
                    data: {},
                },
                on_change: (val) => {
                    this.load();
                }
            });
        }

        this.save();
    }

    select()
    {
        this.options.selected = true;

        if(this.li_elem)
        {
            this.li_elem.classList.add('selected');
        }

        this.layers.layers.forEach((layer) => {
            if(layer.options.key !== this.options.key) layer.deselect();
        });
    }

    deselect() 
    {
        this.options.selected = false;

        if(this.li_elem)
        {
            this.li_elem.classList.remove('selected');
        }
    }

    load()
    {
        this.li_elem = document.querySelector('#layers_list li#' + this.options.key);
        this.layer_elem = document.querySelector('#grid #layers div#l-' + this.options.key);

        if(this.li_elem)
        {
            this.li_elem.innerText = this.options.label;
        }
        else 
        {
            this.li_elem = document.createElement('li');
            this.li_elem.setAttribute('id', this.options.key);
            this.li_elem.innerText = this.options.label;
            this.li_elem.addEventListener('click', (e) => 
            {
                this.layers.layers.forEach((layer) => 
                {
                    if(layer.options.key === this.options.key)
                    {
                        this.select();
                    }
                })
            });
            this.layers.list_elem.appendChild(this.li_elem);
        }

        
        if(!this.layer_elem)
        {
            this.layer_elem = document.createElement('div');
            this.layer_elem.setAttribute('id', 'l-' + this.options.key);
            this.layer_elem.classList.add('layer');
            this.layers.layers_elem.appendChild(this.layer_elem);
        }

        this.layer_elem.innerHTML = '';

        const ys = Object.keys(this.data).sort();
        const max_y = ys[ys.length - 1];
        const xs = Object.keys(this.data).map((y) => {
            const row = Object.keys(this.data[y]).sort();
            return row[row.length - 1];
        }).sort();
        const max_x = xs[xs.length - 1];

        const height = this.layers.settings.settings.grid_height.value > max_y ? this.layers.settings.settings.grid_height.value : max_y;
        const width = this.layers.settings.settings.grid_width.value > max_x ? this.layers.settings.settings.grid_width.value : max_x;

        let last_f = 'initial';
        let last_b = 'initial';

        //build grid rows
        for(let h = 0; h <= height; h++)
        {
            let row = document.createElement('div');
            row.classList.add('grid_row');
            row.setAttribute('y', h);

            //add grid cells
            for(let w = 0; w <= width; w++)
            {
                let cell = document.createElement('div');
                cell.classList.add('grid_cell');

                cell.setAttribute('y', h);
                cell.setAttribute('x', w);

                let char = ' ';
                let f = false;
                let b = false;

                if(this.data[h] && this.data[h][w])
                {
                    const c_data = this.data[h][w];
                    const f_color = colors.find((col) => col.match.includes(c_data.f) || c_data.f === col.irc);
                    const b_color = colors.find((col) => col.match.includes(c_data.b) || c_data.b === col.irc);

                    if(c_data.char !== false && c_data.char !== null && 
                        c_data.char !== undefined && c_data.char.length === 1)
                    {
                        char = c_data.char;
                    } 

                    if(c_data.f === false) //reset
                    {
                        f = 'initial';
                        last_f = f;
                    }
                    else if(f_color)
                    {
                        f = 'rgb(' + f_color.rgb.join(',') + ')';
                        last_f = f;
                    }
                    else 
                    {
                        f = last_f;
                    }

                    if(c_data.b === false) //reset
                    {
                        b = 'initial';
                        last_b = b;
                    }
                    else if(b_color)
                    {
                        b = 'rgb(' + b_color.rgb.join(',') + ')';
                        last_b = b;
                    }
                    else 
                    {
                        b = last_b;
                    }
                }

                cell.innerText = char;
                cell.style['background-color'] = b;
                cell.style['color'] = f;

                row.appendChild(cell);
            }

            this.layer_elem.appendChild(row);
        }

        if(this.options.selected === true)
        {
            this.select();
        }
        else 
        {
            this.deselect();
        }
    }

    save(fire_change)
    {
        this.layers.settings.settings[this.options.key].set_value({
            id: this.options.id,
            label: this.options.label,
            order: this.options.order,
            visible: this.options.visible,
            selected: this.options.selected,
            data: this.data,
        }, fire_change === false ? false : true);
    }

    delete()
    {
        if(this.layers.layers.length < 2) return; //don't delete last layer

        this.li_elem.remove();
        let index = this.layers.layers.indexOf(this);

        if(this.options.selected === true)
        {
            let new_select = this.layers.layers[index - 1] ? this.layers.layers[index - 1] : this.layers.layers[index + 1];
            new_select.select();
        }
        
        this.layers.settings.remove(this.options.key, true);
        this.layers.layers.splice(index, 1);
    }

    edit(action, x, y, data)
    {
        this.data[y] = this.data[y] || {};
        this.data[y][x] = this.data[y][x] || {
            f: null,
            b: null,
            char: null
        };

        let row = this.data[y];
        let cell = row[x];

        console.log({action, x, y, row, cell});

        if(action === 'update')
        {  
            this.data[y][x] = {
                ...this.data[y][x],
                ...data
            };
        }
        else if(action === 'subtract') //backspace, delete
        {
            if(x === 0 && y > 0) //we are at the beginning of the row, & not the first row, move row up
            {
                let prev_row = this.data[y - 1];
                let prev_row_xs = Object.keys(prev_row).sort(function (a, b) {  return +a - +b;  });
                let last_x = +prev_row_xs[prev_row_xs.length - 1];

                for(let xx in row)
                {
                    this.data[y - 1][last_x + +xx + 1] = row[xx];
                }

                let ys = Object.keys(this.data).sort(function (a, b) {  return +a - +b;  });
                let last_y = +ys[ys.length - 1];

                for(let i = y; i <= last_y; i++)
                {
                    if(this.data[i + 1])
                    {
                        this.data[i] = this.data[i + 1]
                    }
                    else 
                    {
                        this.data[i] = [];
                    }
                }
            }
            else if(x > 0)
            {
                let xs = Object.keys(row).sort(function (a, b) {  return +a - +b;  });
                let last_x = +xs[xs.length - 1];

                for(let i = x; i <= last_x; i++)
                {
                    if(this.data[y][i + 1])
                    {
                        this.data[y][i] = this.data[i + 1]
                    }
                    else 
                    {
                        delete this.data[y][i];
                    }
                }
            }
        }
    }

}