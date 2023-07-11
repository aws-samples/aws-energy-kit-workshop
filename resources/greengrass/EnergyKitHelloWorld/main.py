import sys
import src.greeter as greeter

def main():
    args = sys.argv[1:]
    if len(args) == 1:
        print(greeter.get_greeting(args[0]))

if __name__ == "__main__":
    main()