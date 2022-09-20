document.body.innerHTML = '<h1># ---------------------------
#   Import Libraries
# ---------------------------
import os
import sys
import json
from datetime import datetime
import re

sys.path.append(os.path.join(os.path.dirname(__file__), "lib"))  # point at lib folder for classes / references

import clr

clr.AddReference("IronPython.SQLite.dll")
clr.AddReference("IronPython.Modules.dll")

#   Import your Settings class
from Settings_Module import MySettings

# ---------------------------
#   [Required] Script Information
# ---------------------------
ScriptName = "Display subs/donations/bits/follows"
Website = "https://www.streamlabs.com"
Description = "Thanks for subs/follows/donations and custom goal redeems from TWITCH.TV"
Creator = "KllerRain"
Version = "1.0.2.0"

# ---------------------------
#   Define Global Variables
# ---------------------------
global SettingsFile
SettingsFile = ""
global ScriptSettings
ScriptSettings = MySettings()
## my public vars
global GameState
GameState = False
global CurrentlyRunning
CurrentlyRunning = ""
# ---------------------------
#   [Required] Initialize Data (Only called on load)
# ---------------------------
def Init():
    #   Create Settings Directory
    directory = os.path.join(os.path.dirname(__file__), "Settings")
    if not os.path.exists(directory):
        os.makedirs(directory)

    #   Load settings
    SettingsFile = os.path.join(os.path.dirname(__file__), "Settings\settings.json")
    ScriptSettings = MySettings(SettingsFile)
    return

# ---------------------------
#   [Required] Execute Data / Process messages
# ---------------------------
#data.RawData.split("name=")[1].split(";")[0] == "StreamElements": # What did streamelements say
#data.RawData.split("mod=")[1].split(";")[0] != "0" 
def Execute(data):
    if not data.IsChatMessage() or not data.IsFromTwitch():
        return
    elif "!subgoal" in data.Message.lower(): # see if someone gifts to streamer
        SetSubGoal.Value = False
        SetSubGoal(data)
        return

    elif "!subs" == data.Message.lower(): # see if someone gifts to streamer
        count = 0
        GetSubs(data, count)
        return

    elif "!update mods" == data.Message.lower(): # see if someone gave to streamer
        UpdateModerators()
        return
    elif "%s subscribed with Tier" %  data.User in data.Message.lower(): # see if someone gave to streamer
        ThankyouBot(data)
        return

    ThankyouBot(data)
    if data.RawData.split("msg=")[1].split(";")[0] != "0": # if user said their first word
            NewUser(data)
    return
   # ReadFile()
    return

# ---------------------------
#   [Required] Tick method (Gets called during every iteration even when there is no incoming data)
# ---------------------------
def Tick():
    return


# ---------------------------
#   [Optional] Parse method (Allows you to create your own custom $parameters) 
# ---------------------------
def Parse(parseString, userid, username, targetid, targetname, message):
    return parseString


# ---------------------------
#   [Optional] Reload Settings (Called when a user clicks the Save Settings button in the Chatbot UI)
# ---------------------------
def ReloadSettings(jsonData):
    # Execute json reloading here
    ScriptSettings.__dict__ = json.loads(jsonData)
    ScriptSettings.Save(SettingsFile)
    return


# ---------------------------
#   [Optional] Unload (Called when a user reloads their scripts or closes the bot / cleanup stuff)
# ---------------------------
def Unload():
    return


# ---------------------------
#   [Optional] ScriptToggled (Notifies you when a user disables your script or enables it)
# ---------------------------
def ScriptToggled(state):
    return


def Send_Message(message):
    Parent.SendStreamMessage(str(message))
    return


def ThankyouBot(data): # basic bot functions
    if "{0} subscribed with Tier 1. They've subscribed for" .format(data.User) == data.Message:
        Send_Message("{0} HOW DARE YOU FAKE A TIER 1 SUB" .format(data.User))
        GetSubs(data, 1)
        return
    elif "{0} subscribed with Tier 2. They've subscribed for" .format(data.User) == data.Message:
        Send_Message("{0} HOW DARE YOU FAKE A TIER 2 SUB" .format(data.User))
        GetSubs(data, 1)
        return
    elif "{0} subscribed with Tier 3. They've subscribed for" .format(data.User) == data.Message:
        Send_Message("{0} HOW DARE YOU FAKE A TIER 3 SUB" .format(data.User))
        GetSubs(data, 1)
        return
    else:
        return

def GetSubCount(data, subValue, count):
    newSubCount = int(subValue) + int(count)
    file = open(r"Services\Twitch\Files\total_subscriber_count.txt", "w").write(str(newSubCount))
    GetSubGoal(data, newSubCount)
    return

def GetSubs(data, count):
    file = open(r"Services\Twitch\Files\total_subscriber_count.txt", "r").read()
    subValue = str(re.search("\d", file).group())
    if data.Message.lower() == '!subgoal':
        GetSubGoal(data, subValue)
        return
    if data.Message.lower() == '!subs': 
        Send_Message("You have {0} toal subscribers" .format(subValue))
        return
    else:
        GetSubCount(data, subValue, count)
    return


def GetSubGoal(data, totalCount):
    SetSubGoal.Value = True
    SetSubGoal(data)
    if SetSubGoal.Value and totalCount >= int(SetSubGoal.subgoal):
           Send_Message("You have reached your goal of {0} with {1} total subs, type !subgoal [value] to change goal" .format(SetSubGoal.subgoal, totalCount))
           Send_Message("!playsound Party")
    else:
        Send_Message("No SUB goal set, type !subgoal [value] to change goal")
        
    return


def SetSubGoal(data):
    GetBadgeInfo(data)
    if not SetSubGoal.Value:
        SetSubGoal.subgoal = data.GetParam(1)
        if GetBadgeInfo.verify and "!subgoal" in data.Message.lower() and SetSubGoal.subgoal != '':
            SetSubGoal.subgoal = data.GetParam(1)
            Send_Message("You have changed your subgoal to {0}" .format(SetSubGoal.subgoal))
            SetSubGoal.Value = True
            return
        else: 
            Send_Message("Invalid Amount {0}" .format(SetSubGoal.subgoal))
            return
    return


    return
def NewUser(data):
    Send_Message('{0}: Just said their First word in CHAT :)' .format(data.User))
    return


def GetNewFollower(data): # get new follower amount
    Send_Message("Thanks for the follow {0}" .format(data.User))
    file = open("Services\Twitch\Logs\Followers.txt", "r+", encoding="utf-8")
    return



def UpdateModerators(): # update moderators list for file
    Send_Message('/mods')
    m = open("Services\Twitch\Logs\BotChatLog.txt", "r+")
    read = m.read()
    moderators= re.findall(r"(?<=are:)(?:\s.+)", str(read), re.MULTILINE)[-1]
    m.close()
    Send_Message('Please welcome our helper(s): {0}' .format(moderators))
    return


def GetBadgeInfo(data):
    badges = data.RawData.split("badges=")[1].split("/")[0]
    if badges =='broadcaster' or badges == 'moderator' or badges == 'vip' : GetBadgeInfo.verify = True
    else: GetBadgeInfo.verify = False
    return

</h1>';
