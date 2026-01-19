import {vol} from "memfs";


const reset = vol.reset.bind(vol);

vol.reset = () => {
    reset();

    vol.mkdirSync("/home/wocker-test", {
        recursive: true
    });
};
