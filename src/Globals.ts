// define a interface for the message container 

// {messages:string[],
// paginationToken:string}

export interface MessageContainer {
    messages: string[],
    paginationToken: string
}

export const serverPort = 5800;