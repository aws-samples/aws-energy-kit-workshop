import sys
import src.flightcontrol as flightcontrol

def main():
    args = sys.argv[1:]
    if len(args) == 1:
        print(flightcontrol.control_flight(args[0]))

if __name__ == "__main__":
    main()