using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Eynon.Sample.Models
{
    public class FIPS
    {
        public string STATE { get; set; }
        public string STATEFP { get; set; }
        public string COUNTYFP { get; set; }
        public string COUNTYNAME { get; set; }
        public string CLASSFP { get; set; }
        public string CODE
        {
            get
            {
                return STATEFP + COUNTYFP;
            }
        }
        public string CLASSDESCRIPTION
        {
            get
            {
                switch (CLASSFP)
                {
                    case "H1":
                        return "H1:  identifies an active county or statistically equivalent entity that does not qualify under subclass C7 or H6.";
                    case "H4":
                        return "H4:  identifies a legally defined inactive or nonfunctioning county or statistically equivalent entity that does not qualify under subclass H6.";
                    case "H5":
                        return "H5:  identifies census areas in Alaska, a statistical county equivalent entity.";
                    case "H6":
                        return "H6:  identifies a county or statistically equivalent entity that is areally coextensive or governmentally consolidated with an incorporated place, part of an incorporated place, or a consolidated city. ";
                    case "C7":
                        return "C7:  identifies an incorporated place that is an independent city; that is, it also serves as a county equivalent because it is not part of any county, and a minor civil division (MCD) equivalent because it is not part of any MCD.";
                    default:
                        return "";
                }
            }
        }
    }
}