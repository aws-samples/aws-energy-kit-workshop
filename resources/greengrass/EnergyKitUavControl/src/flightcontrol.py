from time import sleep

from djitellopy import tello

uav = tello.Tello()
uav.connect()
print(uav.get_battery())


def test_flight(duration):
    """
    Returns greeting string

    Parameters
    ----------
        name(string): Name to append in the greeting.

    Returns
    -------
        string : Returns greeting for the name
    """
    uav.takeoff()
    uav.send_rc_control(0, 50, 0, 0)
    sleep(duration)
    uav.send_rc_control(0, 50, 0, 0)
    uav.land()
    return uav.get_battery()


test_flight(10)

