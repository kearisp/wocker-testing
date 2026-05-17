type PromptData = Record<string, any>;

let promptMap: PromptData = {};

const prompt = ({message}) => {
    return promptMap[message];
};

export const promptsMock = {
    promptConfirm: prompt,
    promptInput: prompt,
    promptPath: prompt,
    promptSelect: prompt,
    setPromptMock: (map: PromptData) => {
        promptMap = map;
    }
};

