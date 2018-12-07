using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eynon.SampleDAL.Entities
{
    public class FIPS
    {
        public int ID { get; set; }
        public string STATE { get; set; }
        public string STATEFP { get; set; }
        public string COUNTYFP { get; set; }
        public string COUNTYNAME { get; set; }
        public string CLASSFP { get; set; }
    }
}
