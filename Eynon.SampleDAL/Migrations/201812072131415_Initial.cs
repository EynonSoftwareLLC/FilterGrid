namespace Eynon.SampleDAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.FIPS",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        STATE = c.String(unicode: false),
                        STATEFP = c.String(unicode: false),
                        COUNTYFP = c.String(unicode: false),
                        COUNTYNAME = c.String(unicode: false),
                        CLASSFP = c.String(unicode: false),
                    })
                .PrimaryKey(t => t.ID);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.FIPS");
        }
    }
}
