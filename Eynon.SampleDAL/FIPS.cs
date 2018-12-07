using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eynon.SampleDAL
{
    public class FIPS
    {
        private static FIPS _instance;
        public static FIPS Instance { get
            {
                if (_instance == null) _instance = new FIPS();
                return _instance;
            }
        }

        private FIPS() { }

        public void AddOrUpdate(Entities.FIPS fips)
        {
            using (var db = new Main())
            {
                if (db.FIPS.Any(o => o.STATE == fips.STATE && o.COUNTYNAME == fips.COUNTYNAME))
                {
                    var existing = db.FIPS.Where(o => o.STATE == fips.STATE && o.COUNTYNAME == fips.COUNTYNAME).First();
                    existing.STATEFP = fips.STATEFP;
                    existing.COUNTYFP = fips.COUNTYFP;
                    existing.CLASSFP = fips.CLASSFP;
                }
                else
                {
                    db.FIPS.Add(fips);
                }
                db.SaveChanges();
            }
        }
    }
}
