import AsyncModal from "./AsyncModal.js"

class RpcDialog extends AsyncModal {
    constructor(title) {
        super();
        const grid = document.createElement("div");
        grid.className = "sk-cube-grid";
        for (let i = 0; i < 9; ++i) {
            const cube = document.createElement("div");
            cube.className = "sk-cube sk-cube" + (i + 1);
            grid.appendChild(cube);
        }
        this.dialog.appendChild(grid);
        this.dialog.style.backgroundColor = "transparent";
    }
}


export default RpcDialog;