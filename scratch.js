
const handleRequestDetailsSave = () => {

    if (
        true
    ) {
        let detailsBuffer = {
            req_id: license_id,
            name1: name1,
            name2: name2,
            name3: name3,
            name4: name4,
            surname: surname,
            cat_id: cat_id,
            birdate: birdate,
            gen_id: gen_id,
            monam1: monam1,
            monam2: monam2,
            monam3: monam3,
            idnum: idnum,
            iss_id1: iss_id1,
            issdat1: issdat1,
            natnam: natnam,
            iss_id2: iss_id2,
            issdat2: issdat2,
            pro_id: pro_id,
            addresses: addresses,
            nearplace: nearplace,
            mahala: mahala,
            zuqaq: zuqaq,
            dar: dar,
            djp: djp,
            numdet: numdet,
            datedet: datedet,
            phone: phone,
            apptype_Id: apptype_Id,
            appnum: appnum,
            appdate: appdate,
            wea_hold_per: wea_hold_per,
            margin_app: margin_app,
            note: note
        }

        setWeaponRequstDetails(weaponRrequestDetails => [...weaponRrequestDetails, detailsBuffer])



    }
}