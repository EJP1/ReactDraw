import React, { Component } from 'react';
import './draw.css';
import './icons.svg';


class Path extends Component {
    render() {
        var useClass = this.props.pathClass ? 'animate_path' : '';
        console.log('path: ', 'pc', this.props.pathClass, 'uc', useClass);

        return (
            <path className={useClass} d={this.props.d} stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} fill={this.props.fill} />
        );
    }
}

class Draw extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            mouseDown: false,
            steps: 0,
            animate: false,
            stroke: '#222222',
            strokeWidth: '4',
            firstLoad: true
        };
    }
    mouseClick(e, click) {
        if (click) {
            const pathConf = this.calcPath({ e: e, new: true })
            const date = new Date().getTime();
            var newPath;
            // const newPath = <Path key={date}  d={pathConf.d} stroke={pathConf.stroke} strokeWidth={pathConf.strokeWidth} fill={pathConf.fill} />
            const newPaths = this.state.history.slice();
            //Check for new
            if (newPaths.length > 0) {
                const lastD = newPaths[this.state.step].props.d
                const newD = lastD + pathConf.d;
                newPath = <Path key={date} d={newD} pathClass={this.state.animate} stroke={this.state.stroke} strokeWidth={pathConf.strokeWidth} fill={pathConf.fill} />
            }
            else {
                newPath = <Path key={date} d={pathConf.d} pathClass={this.state.animate} stroke={this.state.stroke} strokeWidth={pathConf.strokeWidth} fill={pathConf.fill} />
            }

            //Add path to history
            this.setState({
                history: this.state.history.concat(newPath),
                step: this.state.history.length
            });
        }
        //Update clickstate
        this.setState({
            mouseDown: click,
        });
    }
    drawLine(e) {
        if (this.state.mouseDown) {
            const pathConf = this.calcPath({ e: e, new: false })
            const date = new Date().getTime();
            const newPaths = this.state.history.slice();

            const lastD = newPaths[this.state.step].props.d
            const newD = lastD + pathConf.d;
            const newPath = <Path key={date} pathClass={this.state.animate} d={newD} stroke={this.state.stroke} strokeWidth={pathConf.strokeWidth} fill={pathConf.fill} />
            //Set localstorage
            storage({ mode: 'set', id: 'draw_state', content: [this.state.step, this.state.history] });

            this.setState({
                history: this.state.history.concat(newPath),
                step: this.state.history.length
            });
        }
    }
    //Erase drawing
    erease(e) {
        this.setState({
            history: [],
            step: 0
        });
        storage({ mode: 'remove', id: 'draw_state' })
    }
    //Rewind drawing
    //@TODO: add hold to fast rewind
    rewind(e) {
        const stepBack = this.state.step - 1;
        if (stepBack >= 0)
            this.setState({
                step: stepBack
            });
    }
    //Forward drawing
    //@TODO: add hold to fast forward
    forward(e) {
        const stepForward = this.state.step + 1;
        if (stepForward <= this.state.history.length - 1) {
            this.setState({
                step: stepForward
            });
        }
    }
    //Stupid feature
    animate(e) {
        this.setState({
            animate: !this.state.animate
        });
    }
    //@TODO: Add colorpicker
    colorchange(e) {
        this.setState({
            stroke: '#00adee'
        });
    }
    /**
     * Returns path properties when given mouse coordinates
     * conf.e: mouse event
     * conf.new: new path or continue path (bool)
     * @param {*} conf 
     */
    calcPath(conf) {
        const e = conf.e;
        const canvas = document.getElementById('the-canvas');
        const svg = canvas.getBoundingClientRect();
        const x = (e.pageX - svg.left)
        const y = (e.pageY - svg.top)

        //PATH PROPS
        const stroke = this.state.color;
        const strokeWidth = this.state.strokeWidth;
        const fill = 'none';
        const M = 'M' + x + ' ' + y;
        const L = 'L' + x + ' ' + y;
        const d = (conf.new) ? M + ' ' + L : L;
        return {
            d: d,
            fill: fill,
            stroke: stroke,
            strokeWidth: strokeWidth
        };
    }

    checkStorage() {
        if (this.state.firstLoad) {
            storage({ mode: 'get', id: 'draw_state' }).then(function (res) {
                this.setState({
                    history: res[1],
                    step: res[0],
                });
            }.bind(this)
            ).catch(function(){
                this.setState({
                    firstLoad: false
                });
            })
        }
    }

    render() {
        //@TODO: Finsh storage check onload
        const currentpath = this.state.history[this.state.step]

        return (
            <div>
                <div className="tool_bar">
                    <button className="tool_bar_button_stnd" onMouseDown={(e) => this.erease(e)}>&#10005;</button>
                    {/* <button className="tool_bar_button_stnd" onMouseDown={(e) => this.colorchange(e)}>&#9737;</button> */}
                    {/* <button className="tool_bar_button_stnd" onMouseDown={(e) => this.animate(e)}>&#8523;</button> */}
                    <span className="title"><a> | reDrawable</a></span>
                    <button className="tool_bar_button_stnd right" onMouseDown={(e) => this.forward(e)}>&#10095;</button>
                    <button className="tool_bar_button_stnd right" onMouseDown={(e) => this.rewind(e)}>&#10094;</button>
                </div>
                <div className="info_bar">
                </div>
                <div className="surface" >
                    <svg id="the-canvas" x="0px" y="0px" width="100%" height="100%"
                        onMouseMove={(e) => this.drawLine(e)}
                        onMouseDown={(e) => this.mouseClick(e, true)}
                        onMouseUp={(e) => this.mouseClick(e, false)}
                    //@TODO: add touch support
                    >
                        {currentpath}
                    </svg>
                </div>
            </div>
        );
    }
}

export default Draw;


function storage(conf) {
    return new Promise(function (resolve, reject) {
        if (typeof (Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            switch (conf.mode) {

                case 'remove':
                    resolve(localStorage.removeItem(conf.id));
                    break;
                case 'set':
                    resolve(localStorage.setItem(conf.id, JSON.stringify(conf.content)));
                    break;
                case 'get':
                    resolve(JSON.parse(localStorage.getItem(conf.id)));
                    break;
                default:
                    break;
            }
        }
        else {
            reject('Sorry! No Web Storage support..')
        }
    });
}
