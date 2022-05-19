export class Clock 

{
    constructor(hour, minute)
    {
        if (hour<0 || hour>23)
        {
            throw Error ("The Hour Argument Must Be Between 0 and 23");
        }

        if (minute<0 || minute>59)
        {
            throw Error ("The Minute Argument Must Be Between 0 and 59");
        }
        this.hour = hour
        this.minute = minute
    }

    get timeRe(){
        return (this.hour< 10 ? "0" + this.hour : this.hour) + ":" + (this.minute< 10 ? "0" + this.minute : this.minute)
    }
    
    get time(){
        return{"hour":this.hour.toString().padStart(2, "0"),
        "minute":this.minute.toString().padStart(2, "0")}
    }

    get alarmTime(){
        return this.hour.toString().padStart(2, "0") + ":" + this.minute.toString().padStart(2, "0")
    }
    
    activateAlarm()
    {
        this.alarmIsActive = true
    }
    
    deactivateAlarm()
    {
        this.alarmIsActive = false
    }

    setAlarm(hour,minute)
    {
        if (hour<0 || hour>23)
        {
            throw Error ("The Alarm hour Argument Must Be Between 0 and 23");
        }

        if (minute<0 || minute>59)
        {
            throw Error ("The Alarm Minute Argument Must Be Between 0 and 59");
        }
        this.alarmHour = hour
        this.alarmMinute = minute
        clock.activateAlarm()
    }

    tick()
    {
        this.minute++
        if (this.minute>=60)
        {
            this.hour++ 
            this.minute = 0
        }

        if (this.hour>=24)
        {
            this.hour = 0
        }
        console.log((this.hour< 10 ? "0" + this.hour : this.hour) + ":" + (this.minute< 10 ? "0" + this.minute : this.minute))
        if (this.alarmIsActive == true)
        if ((this.hour == this.alarmHour) && (this.minute == this.alarmMinute))
        {
            console.log("Larm!!!")
        }

    }
}
