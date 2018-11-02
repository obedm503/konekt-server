const Commands = { SUP: 'SUP', PUT: 'PUT', QUIT: 'QUIT' };
const Errors = { fullCol: 1, invalidCol: 2, invalidCommand: 3 };

export const validateCommand = (command: string): boolean => {
  return Object.values(Commands).every(name => command.startsWith(name));
};
