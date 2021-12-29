export const bootAndStateIdXmlResponse = `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <u:getStateResponse xmlns:u="urn:innoxel-ch:service:noxnetRemote:1">
            <u:bootId>usid:3A006A0F3FAB:00000000</u:bootId>
            <u:stateId>usid:3A00D56B404D:0000123B:00001272:00000000:000001B2</u:stateId>
        </u:getStateResponse>
    </s:Body>
</s:Envelope>`;

export const getIdentityResponseMasterRoomClimateModule = `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <u:getIdentityResponse xmlns:u="urn:innoxel-ch:service:noxnetRemote:1">
            <u:moduleList>
                <u:module class="masterRoomClimateModule" index="0" urn="urn:innoxel-ch:noxnet:E5000:X" versionHardware="unknown" versionFirmware="unknown" name="Room 1" description="">
                    <u:thermostat temperatureAlarmLowerLimit="6.0" temperatureAlarmUpperLimit="45.0">
                        <u:setTemperatureLockFlags value="00" />
                        <u:setTemperatureRangeBottom unit="°C" value="16.0" />
                        <u:setTemperatureRangeTop unit="°C" value="28.0" />
                        <u:setbackTemperatureRangeBottom unit="°C" value="6.0" />
                        <u:setbackTemperatureRangeTop unit="°C" value="28.0" />
                    </u:thermostat>
                </u:module>
                <u:module class="masterRoomClimateModule" index="1" urn="urn:innoxel-ch:noxnet:E5000:X" versionHardware="unknown" versionFirmware="unknown" name="Room 2" description="">
                    <u:thermostat temperatureAlarmLowerLimit="6.0" temperatureAlarmUpperLimit="45.0">
                        <u:setTemperatureLockFlags value="00" />
                        <u:setTemperatureRangeBottom unit="°C" value="16.0" />
                        <u:setTemperatureRangeTop unit="°C" value="28.0" />
                        <u:setbackTemperatureRangeBottom unit="°C" value="6.0" />
                        <u:setbackTemperatureRangeTop unit="°C" value="28.0" />
                    </u:thermostat>
                </u:module>
            </u:moduleList>
        </u:getIdentityResponse>
    </s:Body>
</s:Envelope>`;

export const getIdentityResponseMasterInModule = `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <u:getIdentityResponse xmlns:u="urn:innoxel-ch:service:noxnetRemote:1">
            <u:moduleList>
                <u:module index="20" class="masterInModule" urn="urn:innoxel-ch:noxnet:30060:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Room 1" description="INNOXEL Taster RGB G1">
                    <u:optionRoomTemperatureSensor onModule="disabled" onConfig="disabled" />
                    <u:optionRoomHumiditySensor onModule="disabled" onConfig="disabled" />
                    <u:channel index="0" class="masterInModuleChannel" name="" description="" />
                    <u:channel index="1" class="masterInModuleChannel" name="" description="" />
                    <u:channel index="2" class="masterInModuleChannel" name="Channel 20C" description="" />
                    <u:channel index="3" class="masterInModuleChannel" name="Channel 20D" description="" />
                </u:module>
                <u:module index="22" class="masterInModule" urn="urn:innoxel-ch:noxnet:30060:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Room 2" description="INNOXEL Taster RGB G1">
                    <u:optionRoomTemperatureSensor onModule="disabled" onConfig="disabled" />
                    <u:optionRoomHumiditySensor onModule="disabled" onConfig="disabled" />
                    <u:channel index="0" class="masterInModuleChannel" name="Channel 22A" description="" />
                    <u:channel index="1" class="masterInModuleChannel" name="Channel 22B" description="" />
                    <u:channel index="2" class="masterInModuleChannel" name="Channel 22C" description="" />
                    <u:channel index="3" class="masterInModuleChannel" name="Channel 22D" description="" />
                </u:module>
                <u:module index="34" class="masterInModule" urn="urn:innoxel-ch:noxnet:30060:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Room 3" description="INNOXEL Taster RGB G1">
                    <u:optionRoomTemperatureSensor onModule="enabled" onConfig="enabled" />
                    <u:optionRoomHumiditySensor onModule="disabled" onConfig="disabled" />
                    <u:channel index="0" class="masterInModuleChannel" name="Channel 34A" description="" />
                    <u:channel index="1" class="masterInModuleChannel" name="" description="" />
                    <u:channel index="2" class="masterInModuleChannel" name="" description="" />
                    <u:channel index="3" class="masterInModuleChannel" name="" description="" />
                </u:module>
            </u:moduleList>
        </u:getIdentityResponse>
    </s:Body>
</s:Envelope>`;

export const getIdentityResponseMasterOutModule = `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <u:getIdentityResponse xmlns:u="urn:innoxel-ch:service:noxnetRemote:1">
            <u:moduleList>
                <u:module index="0" class="masterOutModule" urn="urn:innoxel-ch:noxnet:40000:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Standort: Alpha" description="Baugruppe: Switch 8">
                    <u:channel index="0" class="masterOutModuleChannel" name="Channel 1A" description="" relayDriveEco="off" />
                    <u:channel index="1" class="masterOutModuleChannel" name="Channel 1B" description="" relayDriveEco="off" />
                    <u:channel index="2" class="masterOutModuleChannel" name="Channel 1C" description="" relayDriveEco="off" />
                    <u:channel index="3" class="masterOutModuleChannel" name="Channel 1D" description="" relayDriveEco="off" />
                    <u:channel index="4" class="masterOutModuleChannel" name="Channel 1E" description="" relayDriveEco="off" />
                    <u:channel index="5" class="masterOutModuleChannel" name="Channel 1F" description="" relayDriveEco="off" />
                    <u:channel index="6" class="masterOutModuleChannel" name="Channel 1G" description="" relayDriveEco="off" />
                    <u:channel index="7" class="masterOutModuleChannel" name="Channel 1H" description="" relayDriveEco="off" />
                </u:module>
                <u:module index="2" class="masterOutModule" urn="urn:innoxel-ch:noxnet:40000:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Standort: Beta" description="Baugruppe: Switch 8">
                    <u:channel index="0" class="masterOutModuleChannel" name="Channel 2A" description="" relayDriveEco="off" />
                    <u:channel index="1" class="masterOutModuleChannel" name="Channel 2B" description="" relayDriveEco="off" />
                    <u:channel index="2">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="3">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="4">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="5">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="6">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="7">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                </u:module>
                <u:module index="63" class="masterOutModule" urn="urn:innoxel-ch:noxnet:40000:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Standort: Flags" description="Baugruppe: Switch 8">
                    <u:channel index="0" class="masterOutModuleChannel" name="Heizung Comfort" description="" relayDriveEco="off" />
                    <u:channel index="1" class="masterOutModuleChannel" name="Heizung Absenkung" description="" relayDriveEco="off" />
                    <u:channel index="2" class="masterOutModuleChannel" name="Heizung Ferienabsenkung" description="" relayDriveEco="off" />
                    <u:channel index="3">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="4">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="5">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="6" class="masterOutModuleChannel" name="Flag Nacht" description="" relayDriveEco="off" />
                    <u:channel index="7" class="masterOutModuleChannel" name="Flag Regen" description="" relayDriveEco="off" />
                </u:module>
            </u:moduleList>
        </u:getIdentityResponse>
    </s:Body>
</s:Envelope>`;

export const getIdentityResponseMasterDimModule = `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <u:getIdentityResponse xmlns:u="urn:innoxel-ch:service:noxnetRemote:1">
            <u:moduleList>
                <u:module index="0" class="masterDimModule" urn="urn:innoxel-ch:noxnet:42000:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Standort: Alpha" description="Baugruppe: Dim 4 x 300 VA">
                    <u:channel index="0" class="masterDimModuleChannel" name="Channel A" description="" />
                    <u:channel index="1" class="masterDimModuleChannel" name="Channel B" description="" />
                    <u:channel index="2" class="masterDimModuleChannel" name="Channel C" description="" />
                    <u:channel index="3" class="masterDimModuleChannel" name="Channel D" description="" />
                </u:module>
                <u:module index="31" class="masterDimModule" urn="urn:innoxel-ch:noxnet:42000:X" uuid="unknown" versionHardware="unknown" versionFirmware="unknown" name="Standort: Virtuell" description="Baugruppe: Dim 4 x 300 VA">
                    <u:channel index="0" class="masterDimModuleChannel" name="Virtuell" description="" />
                    <u:channel index="1">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="2">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                    <u:channel index="3">
                        <u:noxnetError>
                            <u:errorCode>807</u:errorCode>
                            <u:errorDescription>Item is unused</u:errorDescription>
                        </u:noxnetError>
                    </u:channel>
                </u:module>
            </u:moduleList>
        </u:getIdentityResponse>
    </s:Body>
</s:Envelope>`;
