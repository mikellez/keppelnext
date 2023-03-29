def is_leap_year(year):
    # DONE: do not need to modify
    if year % 4 == 0 and year % 100 != 0:
        return True
    if year % 400 == 0:
        return True
    return False

def is_valid(d, m, y):
    # DONE: do not need to modify    
    # d, m, y represents day, month, and year in integer.
    if y < 1970 or y > 9999:
        return False
    if m <= 0 or m > 12:
        return False
    if d <= 0 or d > 31:
        return False

    if m == 4 or m == 6 or m == 9 or m == 11:
        if d > 30:
            return False

    if is_leap_year(y):
        if m == 2 and d > 29:
            return False
    else:
        if m == 2 and d > 28:
            return False
        
    return True

def get_day_month_year(date):
    date_list = date.split("/")
    d = int(date_list[0])
    m = int(date_list[1])
    y = int(date_list[2])
    return (d, m, y)

def less_than_equal(start_day, start_mon, start_year, \
                    end_day, end_mon, end_year):    
    # TODO: return true if start date is before or same as end date
    if start_year > end_year:
        return False
    elif start_year == end_year:    
        if start_mon > end_mon:
            return False
        elif start_mon == end_mon:
            if start_day > end_day:
                return False
            else:
                return True
        else:
            return True
    else:
        return True

def next_date(d, m, y):
    # TODO: get the next date from the current date (d, m, y)
    # return a tuple of integer (day, month, year).
    # if the input date is invalid, return None \
    if is_leap_year(y):
        if m == 2 and d == 29:
            return (1, 3, y)
        if m == 2 and d == 28:
            return (29, 2, y)

    if m == 12:
        if d == 31:
            return (1, 1, y + 1)
    if m == 2:
        if d == 28:
            return (1, 3, y)
    if m == 4 or m == 6 or m == 9 or m == 11:
        if d == 30:
            return (1, m + 1, y)
    if m == 1 or m == 3 or m == 5 or m == 7 or m == 8 or m == 10:
        if d == 31:
            return (1, m + 1, y)    
    return(d + 1, m, y)

def count_days(start_date, end_date):
    # date is represented as a string in format dd/mm/yyyy
    start_day, start_mon, start_year = get_day_month_year(start_date)
    end_day, end_mon, end_year = get_day_month_year(end_date)

    # TODO: check for data validity here #
    # if start date is not valid...
    if is_valid(start_day,start_mon,start_year) == False:
        return("Not a valid date: " + start_date)
    # if end date is not valid...
    if is_valid(end_day,end_mon,end_year) == False:
        return("Not a valid date: " + end_date)
    # if start date > end date...
    if less_than_equal(start_day, start_mon, start_year, end_day, end_mon, end_year) == False:
        return("Start date must be less than or equal end date.")
    
                        
    # lazy - let the computer count from start date to end date
    count = 0
    while less_than_equal(start_day, start_mon, start_year, end_day, end_mon, end_year):
        count = count + 1
        start_day, start_mon, start_year = next_date(start_day, start_mon, start_year)

    # exclude end date
    return count - 1
