using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eynon.SampleDAL
{
    [DbConfigurationType(typeof(MySql.Data.Entity.MySqlEFConfiguration))]
    public class Main : DbContext
    {
        public Main() : base("name=MainContext")
        {

        }

        public DbSet<Entities.FIPS> FIPS { get; set; }
    }
}
